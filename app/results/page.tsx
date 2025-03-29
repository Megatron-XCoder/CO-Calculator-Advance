"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Edit, Trash2, Search, FileSpreadsheet, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface CO {
  code: string
  desc: string
}

interface Question {
  number: string
  statement: string
  co: string
  marks: number
}

interface ExamSetup {
  name: string
  totalMarks: number
  cos: CO[]
  questions: Question[]
}

interface StudentRecord {
  uid: string
  marks: Record<string, number>
  coMarks: Record<string, number>
  totalMarks: number
}

export default function ResultsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [examSetup, setExamSetup] = useState<ExamSetup | null>(null)
  const [studentRecords, setStudentRecords] = useState<StudentRecord[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredRecords, setFilteredRecords] = useState<StudentRecord[]>([])

  useEffect(() => {
    // Load exam setup
    const savedSetup = localStorage.getItem("examSetup")
    if (savedSetup) {
      setExamSetup(JSON.parse(savedSetup))
    } else {
      toast({
        title: "Error",
        description: "No exam setup found. Please set up an exam first.",
        variant: "destructive",
      })
      router.push("/setup")
    }

    // Load student records
    const savedRecords = localStorage.getItem("studentRecords")
    if (savedRecords) {
      const records = JSON.parse(savedRecords)
      setStudentRecords(records)
      setFilteredRecords(records)
    }
  }, [router, toast])

  useEffect(() => {
    if (studentRecords.length > 0) {
      const filtered = studentRecords.filter((record) => record.uid.toLowerCase().includes(searchQuery.toLowerCase()))
      setFilteredRecords(filtered)
    }
  }, [searchQuery, studentRecords])

  const handleEdit = (uid: string) => {
    const record = studentRecords.find((r) => r.uid === uid)
    if (record) {
      // Store the current record in session storage for the entry page to use
      sessionStorage.setItem("editingStudent", JSON.stringify(record))
      router.push("/entry")
    }
  }

  const handleDelete = (uid: string) => {
    setRecordToDelete(uid)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (recordToDelete) {
      const newRecords = studentRecords.filter((r) => r.uid !== recordToDelete)
      setStudentRecords(newRecords)
      setFilteredRecords(newRecords.filter((record) => record.uid.toLowerCase().includes(searchQuery.toLowerCase())))
      localStorage.setItem("studentRecords", JSON.stringify(newRecords))

      toast({
        title: "Success",
        description: `Record for student ${recordToDelete} deleted successfully`,
      })

      setRecordToDelete(null)
    }
    setDeleteDialogOpen(false)
  }

  const exportToCSV = () => {
    if (!examSetup || studentRecords.length === 0) {
      toast({
        title: "Error",
        description: "No records to export",
        variant: "destructive",
      })
      return
    }

    let csv = "UID,"

    // Add question headers
    examSetup.questions.forEach((question) => {
      csv += `Q${question.number} (${question.co}),`
    })

    // Add CO headers
    examSetup.cos.forEach((co) => {
      csv += `${co.code},`
    })

    csv += "Total,Percentage\n"

    // Add data rows
    studentRecords.forEach((record) => {
      csv += `${record.uid},`

      // Question marks
      examSetup.questions.forEach((question) => {
        csv += `${record.marks[question.number] || 0},`
      })

      // CO marks
      examSetup.cos.forEach((co) => {
        csv += `${record.coMarks[co.code] || 0},`
      })

      // Total and percentage
      const percentage = ((record.totalMarks / examSetup.totalMarks) * 100).toFixed(2)
      csv += `${record.totalMarks},${percentage}%\n`
    })

    // Create download link
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.setAttribute("hidden", "")
    a.setAttribute("href", url)
    a.setAttribute("download", `${examSetup.name}_results.csv`)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  if (!examSetup) {
    return <div className="container mx-auto py-10 px-4">Loading...</div>
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Results</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={() => router.push("/entry")} className="flex-1 sm:flex-initial">
            Enter Marks
          </Button>
          <Button variant="outline" onClick={() => router.push("/")} className="flex-1 sm:flex-initial">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </div>
      </div>

      <Card className="mb-6 border-2 shadow-sm overflow-hidden">
        <CardHeader className="bg-primary/5">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {examSetup.name} Results
              </CardTitle>
              <CardDescription>
                Total Students: {studentRecords.length} | Total Marks: {examSetup.totalMarks}
              </CardDescription>
            </div>
            {studentRecords.length > 0 && (
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by UID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-2">
                {studentRecords.length === 0
                  ? "No student records found. Enter marks for students to see results here."
                  : "No matching records found. Try a different search term."}
              </p>
              <Button className="mt-4" onClick={() => router.push("/entry")}>
                Enter Student Marks
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-semibold">UID</TableHead>
                    {examSetup.questions.map((question) => (
                      <TableHead key={question.number} className="font-semibold text-center">
                        Q{question.number}
                        <div className="text-xs font-normal text-muted-foreground">({question.co})</div>
                      </TableHead>
                    ))}
                    {examSetup.cos.map((co) => (
                      <TableHead key={co.code} className="font-semibold text-center">
                        {co.code}
                      </TableHead>
                    ))}
                    <TableHead className="font-semibold text-center">Total</TableHead>
                    <TableHead className="font-semibold text-center">%</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => {
                    const percentage = Math.round((record.totalMarks / examSetup.totalMarks) * 100)
                    let statusColor = "bg-red-500"
                    if (percentage >= 80) statusColor = "bg-green-500"
                    else if (percentage >= 60) statusColor = "bg-blue-500"
                    else if (percentage >= 40) statusColor = "bg-yellow-500"

                    return (
                      <TableRow key={record.uid} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{record.uid}</TableCell>
                        {examSetup.questions.map((question) => (
                          <TableCell key={question.number} className="text-center">
                            {record.marks[question.number] || 0}
                          </TableCell>
                        ))}
                        {examSetup.cos.map((co) => (
                          <TableCell key={co.code} className="text-center font-medium">
                            {record.coMarks[co.code] || 0}
                          </TableCell>
                        ))}
                        <TableCell className="text-center font-bold">{record.totalMarks}</TableCell>
                        <TableCell className="text-center">
                          <Badge className={statusColor}>{percentage}%</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(record.uid)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(record.uid)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        {studentRecords.length > 0 && (
          <CardFooter className="bg-primary/5 p-6">
            <Button onClick={exportToCSV} className="gap-2">
              <FileSpreadsheet className="h-4 w-4" /> Export to CSV
            </Button>
          </CardFooter>
        )}
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the record for student {recordToDelete}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}


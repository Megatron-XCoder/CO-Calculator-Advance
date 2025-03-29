"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Save, ArrowLeft, Calculator, User, CheckCircle2, PenSquare } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

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

export default function MarksEntryPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [examSetup, setExamSetup] = useState<ExamSetup | null>(null)
  const [studentUID, setStudentUID] = useState("")
  const [questionMarks, setQuestionMarks] = useState<Record<string, number>>({})
  const [calculatedMarks, setCalculatedMarks] = useState<{
    coMarks: Record<string, number>
    totalMarks: number
  } | null>(null)
  const [studentRecords, setStudentRecords] = useState<StudentRecord[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)

  useEffect(() => {
    // Load exam setup
    const savedSetup = localStorage.getItem("examSetup")
    if (savedSetup) {
      const setup = JSON.parse(savedSetup)
      setExamSetup(setup)

      // Initialize question marks
      const initialMarks: Record<string, number> = {}
      setup.questions.forEach((q: Question) => {
        initialMarks[q.number] = 0
      })
      setQuestionMarks(initialMarks)
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
      setStudentRecords(JSON.parse(savedRecords))
    }

    // Check if we're editing an existing record
    const editingStudent = sessionStorage.getItem("editingStudent")
    if (editingStudent) {
      const student = JSON.parse(editingStudent)
      setStudentUID(student.uid)
      setQuestionMarks(student.marks)
      setIsEditing(true)
      // Clear the session storage
      sessionStorage.removeItem("editingStudent")
    }
  }, [router, toast])

  const handleMarkChange = (questionNumber: string, marks: number, maxMarks: number) => {
    // Ensure marks don't exceed maximum
    const validMarks = Math.min(marks, maxMarks)

    setQuestionMarks({
      ...questionMarks,
      [questionNumber]: validMarks,
    })

    // Clear calculated marks when inputs change
    setCalculatedMarks(null)
  }

  const calculateMarks = () => {
    if (!examSetup) return

    setIsCalculating(true)

    // Simulate calculation delay for UI feedback
    setTimeout(() => {
      // Initialize CO marks
      const coMarks: Record<string, number> = {}
      examSetup.cos.forEach((co) => {
        coMarks[co.code] = 0
      })

      // Calculate CO-wise marks
      examSetup.questions.forEach((question) => {
        const mark = questionMarks[question.number] || 0
        coMarks[question.co] = (coMarks[question.co] || 0) + mark
      })

      // Calculate total marks
      const totalMarks = Object.values(coMarks).reduce((sum, mark) => sum + mark, 0)

      setCalculatedMarks({ coMarks, totalMarks })
      setIsCalculating(false)
    }, 500)
  }

  const saveStudentMarks = () => {
    if (!examSetup || !calculatedMarks) {
      toast({
        title: "Error",
        description: "Please calculate marks first",
        variant: "destructive",
      })
      return
    }

    if (!studentUID) {
      toast({
        title: "Error",
        description: "Please enter student UID",
        variant: "destructive",
      })
      return
    }

    const studentRecord: StudentRecord = {
      uid: studentUID,
      marks: { ...questionMarks },
      coMarks: { ...calculatedMarks.coMarks },
      totalMarks: calculatedMarks.totalMarks,
    }

    // Check if student already exists
    const existingIndex = studentRecords.findIndex((r) => r.uid === studentUID)
    const newRecords = [...studentRecords]

    if (existingIndex >= 0) {
      newRecords[existingIndex] = studentRecord
    } else {
      newRecords.push(studentRecord)
    }

    setStudentRecords(newRecords)
    localStorage.setItem("studentRecords", JSON.stringify(newRecords))

    toast({
      title: "Success",
      description: `${isEditing ? "Updated" : "Saved"} marks for student ${studentUID}`,
    })

    // Reset form
    setStudentUID("")
    const initialMarks: Record<string, number> = {}
    examSetup.questions.forEach((q) => {
      initialMarks[q.number] = 0
    })
    setQuestionMarks(initialMarks)
    setCalculatedMarks(null)
    setIsEditing(false)
  }

  // Function to get color based on percentage
  const getColorForPercentage = (percentage: number) => {
    if (percentage < 40) return "bg-destructive"
    if (percentage < 60) return "bg-yellow-500"
    if (percentage < 80) return "bg-blue-500"
    return "bg-green-500"
  }

  if (!examSetup) {
    return <div className="container mx-auto py-10 px-4">Loading...</div>
  }

  const percentage = calculatedMarks ? Math.round((calculatedMarks.totalMarks / examSetup.totalMarks) * 100) : 0

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Marks Entry</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={() => router.push("/results")} className="flex-1 sm:flex-initial">
            View Results
          </Button>
          <Button variant="outline" onClick={() => router.push("/")} className="flex-1 sm:flex-initial">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </div>
      </div>

      <Card className="mb-6 border-2 shadow-sm">
        <CardHeader className="bg-primary/5">
          <CardTitle>{examSetup.name}</CardTitle>
          <CardDescription>Total Marks: {examSetup.totalMarks}</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid w-full items-center gap-1.5 mb-6">
            <Label htmlFor="studentUID" className="text-base flex items-center gap-1">
              <User className="h-4 w-4" /> Student UID
            </Label>
            <Input
              id="studentUID"
              placeholder="Enter student UID"
              value={studentUID}
              onChange={(e) => setStudentUID(e.target.value)}
              className="text-base py-5"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <PenSquare className="h-5 w-5" /> Enter Marks for Each Question
            </h3>

            <div className="grid gap-4">
              {examSetup.questions.map((question, index) => (
                <Card key={index} className="overflow-hidden border shadow-none">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <div className="md:col-span-2">
                        <div className="flex items-start gap-2">
                          <Badge variant="outline" className="mt-0.5 shrink-0">
                            Q{question.number}
                          </Badge>
                          <div>
                            <Label className="font-medium">{question.statement}</Label>
                            <div className="text-sm text-muted-foreground mt-1 flex flex-wrap gap-2">
                              <Badge variant="secondary">{question.co}</Badge>
                              <span>Max Marks: {question.marks}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <Input
                          type="number"
                          min="0"
                          max={question.marks}
                          value={questionMarks[question.number] || 0}
                          onChange={(e) =>
                            handleMarkChange(question.number, Number.parseInt(e.target.value) || 0, question.marks)
                          }
                          className="text-center font-medium text-base"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-4 bg-primary/5 p-6">
          <Button onClick={calculateMarks} className="flex-1" size="lg" disabled={isCalculating}>
            {isCalculating ? (
              <>Calculating...</>
            ) : (
              <>
                <Calculator className="mr-2 h-4 w-4" /> Calculate Marks
              </>
            )}
          </Button>
          <Button
            onClick={saveStudentMarks}
            className="flex-1"
            size="lg"
            disabled={!calculatedMarks}
            variant={calculatedMarks ? "default" : "outline"}
          >
            <Save className="mr-2 h-4 w-4" /> {isEditing ? "Update" : "Save"} Marks
          </Button>
        </CardFooter>
      </Card>

      {calculatedMarks && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="border-2 shadow-md overflow-hidden">
            <CardHeader className="bg-primary/5 pb-4">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    Calculated Marks
                  </CardTitle>
                  <CardDescription>Student UID: {studentUID}</CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">
                    {calculatedMarks.totalMarks} / {examSetup.totalMarks}
                  </div>
                  <Badge
                    className={`${percentage >= 40 ? "bg-green-500 hover:bg-green-600" : "bg-destructive hover:bg-destructive/90"}`}
                  >
                    {percentage}%
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Progress</span>
                  <span className="text-sm font-medium">{percentage}%</span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">CO-wise Performance</h3>
                  <div className="space-y-4">
                    {Object.entries(calculatedMarks.coMarks).map(([co, marks]) => {
                      // Find the total possible marks for this CO
                      const totalPossibleMarks = examSetup.questions
                        .filter((q) => q.co === co)
                        .reduce((sum, q) => sum + q.marks, 0)

                      const coPercentage = Math.round((marks / totalPossibleMarks) * 100)

                      return (
                        <div key={co}>
                          <div className="flex justify-between mb-1">
                            <span className="font-medium">{co}</span>
                            <span>
                              {marks} / {totalPossibleMarks} ({coPercentage}%)
                            </span>
                          </div>
                          <Progress value={coPercentage} className={`h-2 ${getColorForPercentage(coPercentage)}`} />
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="bg-muted/20 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-4">Question-wise Breakdown</h3>
                  <div className="space-y-3">
                    {examSetup.questions.map((question) => {
                      const mark = questionMarks[question.number] || 0
                      const qPercentage = Math.round((mark / question.marks) * 100)

                      return (
                        <div key={question.number} className="flex items-center gap-3">
                          <Badge variant="outline" className="shrink-0">
                            Q{question.number}
                          </Badge>
                          <Progress
                            value={qPercentage}
                            className={`h-2 flex-1 ${getColorForPercentage(qPercentage)}`}
                          />
                          <span className="text-sm font-medium w-16 text-right">
                            {mark}/{question.marks}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-primary/5 p-6">
              <Button onClick={saveStudentMarks} className="w-full" size="lg">
                <Save className="mr-2 h-4 w-4" /> {isEditing ? "Update" : "Save"} Student Record
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      )}
    </div>
  )
}


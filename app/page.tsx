"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import { BookOpen, PenSquare, BarChart3, Settings, Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
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

interface ExamSetup {
  id: string
  name: string
  totalMarks: number
  cos: any[]
  questions: any[]
  createdAt: number
}

export default function Home() {
  const router = useRouter()
  const { toast } = useToast()
  const [exams, setExams] = useState<ExamSetup[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [examToDelete, setExamToDelete] = useState<string | null>(null)

  useEffect(() => {
    // Load all exams from localStorage
    const loadExams = () => {
      const examsList = localStorage.getItem("examsList")
      if (examsList) {
        setExams(JSON.parse(examsList))
      }
    }

    loadExams()
  }, [])

  const createNewExam = () => {
    // Navigate to setup page with a new exam ID
    const newExamId = `exam_${Date.now()}`
    router.push(`/setup/${newExamId}`)
  }

  const handleExamClick = (examId: string) => {
    // Set current exam and navigate to entry page
    localStorage.setItem("currentExamId", examId)
    router.push(`/entry/${examId}`)
  }

  const handleDeleteExam = (examId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent navigating to the exam
    setExamToDelete(examId)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteExam = () => {
    if (!examToDelete) return

    // Remove exam from the list
    const updatedExams = exams.filter((exam) => exam.id !== examToDelete)
    setExams(updatedExams)
    localStorage.setItem("examsList", JSON.stringify(updatedExams))

    // Remove exam data
    localStorage.removeItem(`examSetup_${examToDelete}`)
    localStorage.removeItem(`studentRecords_${examToDelete}`)

    toast({
      title: "Exam Deleted",
      description: "The exam and all its records have been deleted.",
    })

    setExamToDelete(null)
    setDeleteDialogOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-2">CO Marks Calculator</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A comprehensive tool for teachers to calculate and track student marks based on Course Outcomes (COs)
          </p>
        </div>

        <div className="mb-8 flex justify-center">
          <Button onClick={createNewExam} size="lg" className="gap-2">
            <Plus className="h-5 w-5" /> Create New Exam
          </Button>
        </div>

        {exams.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {exams.map((exam) => (
              <Card
                key={exam.id}
                className="overflow-hidden border-2 transition-all duration-300 hover:shadow-lg cursor-pointer"
                onClick={() => handleExamClick(exam.id)}
              >
                <CardHeader className="bg-primary/5 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        {exam.name}
                      </CardTitle>
                      <CardDescription>Created {new Date(exam.createdAt).toLocaleDateString()}</CardDescription>
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => handleDeleteExam(exam.id, e)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Marks:</span>
                      <span className="font-medium">{exam.totalMarks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Course Outcomes:</span>
                      <span className="font-medium">{exam.cos.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Questions:</span>
                      <span className="font-medium">{exam.questions.length}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2 bg-primary/5 pt-4">
                  <Button className="w-full" size="lg">
                    <PenSquare className="mr-2 h-4 w-4" />
                    Enter Marks
                  </Button>
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        localStorage.setItem("currentExamId", exam.id)
                        router.push(`/results/${exam.id}`)
                      }}
                      variant="outline"
                    >
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Results
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/setup/${exam.id}`)
                      }}
                      variant="outline"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="max-w-md mx-auto border-2 border-dashed">
            <CardHeader className="text-center">
              <CardTitle>No Exams Found</CardTitle>
              <CardDescription>Create your first exam to get started with CO-based assessment</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-6">
              <Button onClick={createNewExam} className="gap-2">
                <Plus className="h-4 w-4" /> Create Your First Exam
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Exam</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this exam and all student records associated with it. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteExam}
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


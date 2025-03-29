"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, Plus, Save, ArrowLeft, BookOpen, ListChecks, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

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

export default function SetupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [examSetup, setExamSetup] = useState<ExamSetup>({
    name: "",
    totalMarks: 0,
    cos: [{ code: "", desc: "" }],
    questions: [{ number: "", statement: "", co: "", marks: 0 }],
  })
  const [activeTab, setActiveTab] = useState("basic")

  useEffect(() => {
    // Check if exam setup exists in localStorage
    const savedSetup = localStorage.getItem("examSetup")
    if (savedSetup) {
      setExamSetup(JSON.parse(savedSetup))
    }
  }, [])

  const addCO = () => {
    setExamSetup({
      ...examSetup,
      cos: [...examSetup.cos, { code: "", desc: "" }],
    })
  }

  const removeCO = (index: number) => {
    const newCOs = [...examSetup.cos]
    newCOs.splice(index, 1)
    setExamSetup({
      ...examSetup,
      cos: newCOs,
    })
  }

  const updateCO = (index: number, field: keyof CO, value: string) => {
    const newCOs = [...examSetup.cos]
    newCOs[index] = { ...newCOs[index], [field]: value }
    setExamSetup({
      ...examSetup,
      cos: newCOs,
    })
  }

  const addQuestion = () => {
    setExamSetup({
      ...examSetup,
      questions: [...examSetup.questions, { number: "", statement: "", co: "", marks: 0 }],
    })
  }

  const removeQuestion = (index: number) => {
    const newQuestions = [...examSetup.questions]
    newQuestions.splice(index, 1)
    setExamSetup({
      ...examSetup,
      questions: newQuestions,
    })
  }

  const updateQuestion = (index: number, field: keyof Question, value: string | number) => {
    const newQuestions = [...examSetup.questions]
    newQuestions[index] = { ...newQuestions[index], [field]: value }
    setExamSetup({
      ...examSetup,
      questions: newQuestions,
    })
  }

  const saveSetup = () => {
    // Validate
    if (!examSetup.name) {
      toast({
        title: "Error",
        description: "Please enter exam name",
        variant: "destructive",
      })
      return
    }

    if (examSetup.totalMarks <= 0) {
      toast({
        title: "Error",
        description: "Please enter valid total marks",
        variant: "destructive",
      })
      return
    }

    if (examSetup.cos.length === 0 || !examSetup.cos[0].code) {
      toast({
        title: "Error",
        description: "Please add at least one CO",
        variant: "destructive",
      })
      setActiveTab("cos")
      return
    }

    if (examSetup.questions.length === 0 || !examSetup.questions[0].number) {
      toast({
        title: "Error",
        description: "Please add at least one question",
        variant: "destructive",
      })
      setActiveTab("questions")
      return
    }

    // Filter out empty entries
    const filteredCOs = examSetup.cos.filter((co) => co.code && co.desc)
    const filteredQuestions = examSetup.questions.filter((q) => q.number && q.co && q.marks > 0)

    const finalSetup = {
      ...examSetup,
      cos: filteredCOs,
      questions: filteredQuestions,
    }

    // Save to localStorage
    localStorage.setItem("examSetup", JSON.stringify(finalSetup))

    toast({
      title: "Success",
      description: "Exam setup saved successfully!",
    })

    // Navigate to marks entry page
    router.push("/entry")
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Exam Setup</h1>
        <Button variant="outline" onClick={() => router.push("/")} className="w-full sm:w-auto">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" /> Basic Info
          </TabsTrigger>
          <TabsTrigger value="cos" className="flex items-center gap-2">
            <ListChecks className="h-4 w-4" /> Course Outcomes
          </TabsTrigger>
          <TabsTrigger value="questions" className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> Questions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card className="border-2 shadow-sm">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" /> Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="examName" className="text-base">
                  Exam Name
                </Label>
                <Input
                  id="examName"
                  placeholder="e.g., Mid Semester Test-2"
                  value={examSetup.name}
                  onChange={(e) => setExamSetup({ ...examSetup, name: e.target.value })}
                  className="text-base py-5"
                />
              </div>

              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="totalMarks" className="text-base">
                  Total Marks
                </Label>
                <Input
                  id="totalMarks"
                  type="number"
                  placeholder="e.g., 20"
                  value={examSetup.totalMarks || ""}
                  onChange={(e) => setExamSetup({ ...examSetup, totalMarks: Number.parseInt(e.target.value) || 0 })}
                  className="text-base py-5"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between bg-primary/5 p-6">
              <Button variant="outline" onClick={() => router.push("/")}>
                Cancel
              </Button>
              <Button onClick={() => handleTabChange("cos")}>Next: Course Outcomes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="cos">
          <Card className="border-2 shadow-sm">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2">
                <ListChecks className="h-5 w-5" /> Course Outcomes (COs)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {examSetup.cos.map((co, index) => (
                  <Card key={index} className="border shadow-none">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className="h-8 w-8 rounded-full flex items-center justify-center p-0 shrink-0"
                        >
                          {index + 1}
                        </Badge>
                        <div className="grid md:grid-cols-2 gap-3 flex-1">
                          <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor={`co-code-${index}`}>CO Code</Label>
                            <Input
                              id={`co-code-${index}`}
                              placeholder="e.g., CO1"
                              value={co.code}
                              onChange={(e) => updateCO(index, "code", e.target.value)}
                            />
                          </div>
                          <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor={`co-desc-${index}`}>Description</Label>
                            <Input
                              id={`co-desc-${index}`}
                              placeholder="CO Description"
                              value={co.desc}
                              onChange={(e) => updateCO(index, "desc", e.target.value)}
                            />
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => removeCO(index)}
                          disabled={examSetup.cos.length === 1}
                          className="shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button onClick={addCO} className="w-full" variant="outline">
                  <Plus className="mr-2 h-4 w-4" /> Add Course Outcome
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between bg-primary/5 p-6">
              <Button variant="outline" onClick={() => handleTabChange("basic")}>
                Back: Basic Info
              </Button>
              <Button onClick={() => handleTabChange("questions")}>Next: Questions</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="questions">
          <Card className="border-2 shadow-sm">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" /> Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {examSetup.questions.map((question, index) => (
                  <Card key={index} className="border shadow-none overflow-hidden">
                    <CardHeader className="bg-muted/30 py-3">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="h-6 w-6 rounded-full flex items-center justify-center p-0"
                          >
                            {index + 1}
                          </Badge>
                          Question {index + 1}
                        </CardTitle>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeQuestion(index)}
                          disabled={examSetup.questions.length === 1}
                        >
                          <X className="h-4 w-4 mr-1" /> Remove
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="grid w-full items-center gap-1.5">
                          <Label htmlFor={`q-number-${index}`}>Question Number</Label>
                          <Input
                            id={`q-number-${index}`}
                            placeholder="e.g., 1"
                            value={question.number}
                            onChange={(e) => updateQuestion(index, "number", e.target.value)}
                          />
                        </div>
                        <div className="grid w-full items-center gap-1.5">
                          <Label htmlFor={`q-marks-${index}`}>Marks</Label>
                          <Input
                            id={`q-marks-${index}`}
                            type="number"
                            placeholder="e.g., 5"
                            value={question.marks || ""}
                            onChange={(e) => updateQuestion(index, "marks", Number.parseInt(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                      <div className="grid w-full items-center gap-1.5 mb-4">
                        <Label htmlFor={`q-statement-${index}`}>Statement</Label>
                        <Input
                          id={`q-statement-${index}`}
                          placeholder="Question statement"
                          value={question.statement}
                          onChange={(e) => updateQuestion(index, "statement", e.target.value)}
                        />
                      </div>
                      <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor={`q-co-${index}`}>CO Mapping</Label>
                        <Select value={question.co} onValueChange={(value) => updateQuestion(index, "co", value)}>
                          <SelectTrigger id={`q-co-${index}`}>
                            <SelectValue placeholder="Select CO" />
                          </SelectTrigger>
                          <SelectContent>
                            {examSetup.cos
                              .filter((co) => co.code)
                              .map((co, coIndex) => (
                                <SelectItem key={coIndex} value={co.code}>
                                  {co.code} - {co.desc}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button onClick={addQuestion} className="w-full" variant="outline">
                  <Plus className="mr-2 h-4 w-4" /> Add Question
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between bg-primary/5 p-6">
              <Button variant="outline" onClick={() => handleTabChange("cos")}>
                Back: Course Outcomes
              </Button>
              <Button onClick={saveSetup} size="lg">
                <Save className="mr-2 h-4 w-4" /> Save Exam Setup
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


"use client"

import { useEffect, useRef, useState } from "react"
import { Mic, MicOff, Copy, Download, Mail, Sparkles, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

export default function EmailAssistant() {
  const speechLang = {
    english: "en-US",
    hindi: "hi-IN",
    marathi: "mr-IN"
  }
  
  const [inputText, setInputText] = useState("")
  const [convertedEmail, setConvertedEmail] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [formalTone, setFormalTone] = useState(true)
  const [autoGreeting, setAutoGreeting] = useState(true)
  const [selectedLanguage, setSelectedLanguage] = useState("english")
  const [isConverting, setIsConverting] = useState(false)
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        alert('Speech Recognition not supported in this browser');
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = speechLang[selectedLanguage as keyof typeof speechLang];
      console.log(speechLang[selectedLanguage as keyof typeof speechLang])
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        const speech = event.results[0][0].transcript;
        console.log("speech", speech)
        setInputText(prev => prev + " " + speech);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
      };

      recognitionRef.current = recognition;
    }
  }, [
    selectedLanguage
  ]);

  const handleConvertToEmail = async () => {
    console.log("Converting to email:", inputText)
    if (!inputText.trim()) return

    setIsConverting(true)
    setConvertedEmail("")
    try {
      const eventSource = new EventSource(`/api/convert-to-email?prompt=${inputText}&language=${selectedLanguage}&formalTone=${formalTone}&autoGreeting=${autoGreeting}`);
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.text) setConvertedEmail(prev => prev + data.text);
        else if (data.done) {
          setIsConverting(false);
          eventSource.close();
        }
      }
      eventSource.onerror = () => {
        setIsConverting(false);
        eventSource.close();
      }
    } catch {
      setIsConverting(false);
    }
  }

  const handleClearInput = () => {
    setInputText("")
    setConvertedEmail("")
  }

  const handleMicClick = () => {
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  }

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(convertedEmail)
      // You could add a toast notification here
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const handleDownload = () => {
    const element = document.createElement("a")
    const file = new Blob([convertedEmail], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = "professional-email.txt"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const characterCount = inputText.length
  const maxCharacters = 50000

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Email Assistant</h1>
                <p className="text-sm text-gray-600">Convert text to professional emails in seconds</p>
              </div>
            </div>
            <Badge variant="secondary" className="hidden sm:flex">
              <Sparkles className="w-3 h-3 mr-1" />
              AI Powered
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Input Section */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-blue-600" />
                  Enter your message or thoughts:
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Textarea
                    placeholder="Type your informal message, bullet points, or thoughts here..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="min-h-[200px] pr-12 resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    maxLength={maxCharacters}
                  />
                  <Button
                    variant={isRecording ? "destructive" : "outline"}
                    size="icon"
                    className={`absolute bottom-3 right-3 transition-all duration-200 ${
                      isRecording ? "animate-pulse" : ""
                    }`}
                    onClick={handleMicClick}
                  >
                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                </div>

                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>
                    {isRecording && (
                      <span className="flex items-center gap-2 text-red-500">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        Recording...
                      </span>
                    )}
                  </span>
                  <span className={characterCount > maxCharacters * 0.9 ? "text-orange-500" : ""}>
                    {characterCount}/{maxCharacters}
                  </span>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleConvertToEmail}
                    disabled={!inputText.trim() || isConverting}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {isConverting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Converting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Convert to Email
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={handleClearInput} disabled={!inputText}>
                    Clear Input
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Email Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="formal-tone" className="text-sm font-medium">
                    Use Formal Tone
                  </Label>
                  <Switch id="formal-tone" checked={formalTone} onCheckedChange={setFormalTone} />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-greeting" className="text-sm font-medium">
                    Include Greeting and Sign-off
                  </Label>
                  <Switch id="auto-greeting" checked={autoGreeting} onCheckedChange={setAutoGreeting} />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Select Language</Label>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="hindi">Hindi</SelectItem>
                      <SelectItem value="marathi">Marathi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-green-600" />
                  Your professional email:
                </CardTitle>
              </CardHeader>
              <CardContent>
                {convertedEmail ? (
                  <div className="space-y-4">
                    <div className="bg-gray-50 border rounded-lg p-4 min-h-[300px] font-mono text-sm whitespace-pre-wrap">
                      {convertedEmail}
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={handleCopyToClipboard} variant="outline" className="flex-1">
                        <Copy className="w-4 h-4 mr-2" />
                        Copy to Clipboard
                      </Button>
                      <Button onClick={handleDownload} variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-8 text-center min-h-[300px] flex items-center justify-center">
                    <div className="text-gray-500">
                      <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">No email generated yet</p>
                      <p className="text-sm">Enter your message and click "Convert to Email" to see the result</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-8">
          <Separator className="mb-6" />
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
                <Mail className="w-3 h-3 text-white" />
              </div>
              <span>Email Assistant</span>
            </div>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                Privacy
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                Terms
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

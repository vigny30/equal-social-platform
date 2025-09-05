"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, User, Palette } from "lucide-react"
import { Label } from "@/components/ui/label"

// Pre-made avatar options similar to Reddit style
const presetAvatars = [
  { id: 1, src: "/friendly-blue-robot.png", name: "Friendly Robot" },
  { id: 2, src: "/cool-purple-cat-avatar.png", name: "Cool Cat" },
  { id: 3, src: "/space-astronaut-avatar.png", name: "Space Explorer" },
  { id: 4, src: "/dark-ninja-avatar.png", name: "Shadow Ninja" },
  { id: 5, src: "/wizard-avatar-magical.png", name: "Mystic Wizard" },
  { id: 6, src: "/adventurous-pirate-avatar.png", name: "Sea Captain" },
  { id: 7, src: "/alien-avatar-green.png", name: "Cosmic Being" },
  { id: 8, src: "/fantasy-dragon-avatar.png", name: "Fire Dragon" },
  { id: 9, src: "/unicorn-avatar-rainbow.png", name: "Rainbow Unicorn" },
  { id: 10, src: "/phoenix-avatar-flame.png", name: "Phoenix Rising" },
  { id: 11, src: "/placeholder.svg?height=100&width=100", name: "Cyber Punk" },
  { id: 12, src: "/placeholder.svg?height=100&width=100", name: "Forest Guardian" },
]

interface AvatarSelectorProps {
  currentAvatar: string | null
  onSave: (avatarData: { type: "upload" | "preset"; src: string; name?: string }) => void
}

export function AvatarSelector({ currentAvatar, onSave }: AvatarSelectorProps) {
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("upload")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB")
        return
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file")
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setUploadedImage(result)
        setSelectedPreset(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePresetSelect = (avatar: (typeof presetAvatars)[0]) => {
    setSelectedPreset(avatar.id)
    setUploadedImage(null)
  }

  const handleSave = () => {
    if (uploadedImage) {
      onSave({ type: "upload", src: uploadedImage })
    } else if (selectedPreset) {
      const preset = presetAvatars.find((a) => a.id === selectedPreset)
      if (preset) {
        onSave({ type: "preset", src: preset.src, name: preset.name })
      }
    }
  }

  const getPreviewSrc = () => {
    if (uploadedImage) return uploadedImage
    if (selectedPreset) {
      const preset = presetAvatars.find((a) => a.id === selectedPreset)
      return preset?.src
    }
    return currentAvatar
  }

  return (
    <div className="space-y-6">
      {/* Preview */}
      <div className="text-center">
        <Avatar className="w-32 h-32 mx-auto mb-4 border-4 border-white/20">
          <AvatarImage src={getPreviewSrc() || undefined} />
          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-2xl">
            <User className="w-16 h-16" />
          </AvatarFallback>
        </Avatar>
        <p className="text-white/70 text-sm">Preview of your avatar</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white/10">
          <TabsTrigger value="upload" className="data-[state=active]:bg-white/20 text-white">
            <Upload className="w-4 h-4 mr-2" />
            Upload Photo
          </TabsTrigger>
          <TabsTrigger value="presets" className="data-[state=active]:bg-white/20 text-white">
            <Palette className="w-4 h-4 mr-2" />
            Choose Avatar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <div className="space-y-4">
            <Label className="text-white/90">Upload from your device</Label>
            <div
              className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center cursor-pointer hover:border-white/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 text-white/50 mx-auto mb-4" />
              <p className="text-white/70 mb-2">Click to upload or drag and drop</p>
              <p className="text-white/50 text-sm">PNG, JPG, GIF up to 5MB</p>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </div>
        </TabsContent>

        <TabsContent value="presets" className="space-y-4">
          <Label className="text-white/90">Choose from preset avatars</Label>
          <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto">
            {presetAvatars.map((avatar) => (
              <div
                key={avatar.id}
                className={`cursor-pointer rounded-lg p-2 transition-all ${
                  selectedPreset === avatar.id
                    ? "bg-purple-500/30 border-2 border-purple-400"
                    : "bg-white/5 border-2 border-transparent hover:border-white/30"
                }`}
                onClick={() => handlePresetSelect(avatar)}
              >
                <Avatar className="w-16 h-16 mx-auto mb-2">
                  <AvatarImage src={avatar.src || "/placeholder.svg"} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-xs">
                    {avatar.name.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <p className="text-white/70 text-xs text-center truncate">{avatar.name}</p>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Button
        onClick={handleSave}
        disabled={!uploadedImage && !selectedPreset}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50"
      >
        Save Avatar
      </Button>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Building2, Phone, Mail, MapPin, Clock, Globe, Save, RotateCcw } from 'lucide-react'

interface ClinicInfo {
  clinicName: string
  tagline: string
  email: string
  phone: string
  fax: string
  website: string
  address: string
  city: string
  state: string
  zip: string
  country: string
  timezone: string
  openingHours: string
  emergencyPhone: string
  taxId: string
  licenseNumber: string
  description: string
}

const defaultClinicInfo: ClinicInfo = {
  clinicName: 'ClinicAnt Veterinary Practice',
  tagline: 'Caring for your pets like family',
  email: 'info@clinicant.com',
  phone: '(555) 100-2000',
  fax: '(555) 100-2001',
  website: 'https://www.clinicant.com',
  address: '1234 Paw Lane',
  city: 'Toronto',
  state: 'ON',
  zip: 'M5V 1A1',
  country: 'Canada',
  timezone: 'America/Toronto',
  openingHours: 'Mon-Fri: 8:00 AM - 6:00 PM\nSat: 9:00 AM - 2:00 PM\nSun: Closed',
  emergencyPhone: '(555) 100-9999',
  taxId: '',
  licenseNumber: '',
  description: '',
}

const timezones = [
  'America/St_Johns',
  'America/Halifax',
  'America/Toronto',
  'America/Winnipeg',
  'America/Regina',
  'America/Edmonton',
  'America/Vancouver',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
]

const provinces = [
  'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT',
]

export function SettingsContent() {
  const [clinicInfo, setClinicInfo] = useState<ClinicInfo>(defaultClinicInfo)
  const [saved, setSaved] = useState(false)

  const handleChange = (field: keyof ClinicInfo, value: string) => {
    setClinicInfo((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleReset = () => {
    setClinicInfo(defaultClinicInfo)
    setSaved(false)
  }

  return (
    <div className="p-3 md:p-6 space-y-6 max-w-4xl">
      <div className="hidden md:block">
        <h1 className="text-2xl font-bold tracking-tight text-balance">Settings</h1>
        <p className="text-muted-foreground">Manage your clinic information and preferences.</p>
      </div>

      {/* Clinic Identity */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Building2 className="size-4 md:size-5 text-primary" />
            Clinic Identity
          </CardTitle>
          <CardDescription>Basic information about your veterinary practice</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="clinicName">Clinic Name</Label>
              <Input
                id="clinicName"
                value={clinicInfo.clinicName}
                onChange={(e) => handleChange('clinicName', e.target.value)}
                placeholder="Enter clinic name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={clinicInfo.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                placeholder="A short description"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={clinicInfo.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe your clinic, services offered, specialities..."
              rows={3}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="taxId">Tax ID / EIN</Label>
              <Input
                id="taxId"
                value={clinicInfo.taxId}
                onChange={(e) => handleChange('taxId', e.target.value)}
                placeholder="XX-XXXXXXX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="licenseNumber">License Number</Label>
              <Input
                id="licenseNumber"
                value={clinicInfo.licenseNumber}
                onChange={(e) => handleChange('licenseNumber', e.target.value)}
                placeholder="Veterinary license #"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Phone className="size-4 md:size-5 text-primary" />
            Contact Information
          </CardTitle>
          <CardDescription>How clients can reach your clinic</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-1.5">
                <Mail className="size-3.5 text-muted-foreground" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={clinicInfo.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="clinic@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website" className="flex items-center gap-1.5">
                <Globe className="size-3.5 text-muted-foreground" />
                Website
              </Label>
              <Input
                id="website"
                type="url"
                value={clinicInfo.website}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="https://www.example.com"
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={clinicInfo.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="(555) 000-0000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fax">Fax</Label>
              <Input
                id="fax"
                type="tel"
                value={clinicInfo.fax}
                onChange={(e) => handleChange('fax', e.target.value)}
                placeholder="(555) 000-0000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyPhone">Emergency Line</Label>
              <Input
                id="emergencyPhone"
                type="tel"
                value={clinicInfo.emergencyPhone}
                onChange={(e) => handleChange('emergencyPhone', e.target.value)}
                placeholder="(555) 000-0000"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <MapPin className="size-4 md:size-5 text-primary" />
            Location
          </CardTitle>
          <CardDescription>Your clinic address and locale settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Street Address</Label>
            <Input
              id="address"
              value={clinicInfo.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="123 Main St"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2 md:col-span-1">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={clinicInfo.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="City"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">Province / State</Label>
              <Select value={clinicInfo.state} onValueChange={(v) => handleChange('state', v)}>
                <SelectTrigger id="state">
                  <SelectValue placeholder="Province" />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip">Postal Code</Label>
              <Input
                id="zip"
                value={clinicInfo.zip}
                onChange={(e) => handleChange('zip', e.target.value)}
                placeholder="00000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={clinicInfo.country}
                onChange={(e) => handleChange('country', e.target.value)}
                placeholder="Country"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hours & Timezone */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Clock className="size-4 md:size-5 text-primary" />
            Hours & Timezone
          </CardTitle>
          <CardDescription>Operating schedule and timezone for your clinic</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select value={clinicInfo.timezone} onValueChange={(v) => handleChange('timezone', v)}>
              <SelectTrigger id="timezone">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((tz) => (
                  <SelectItem key={tz} value={tz}>{tz.replace('_', ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="openingHours">Opening Hours</Label>
            <Textarea
              id="openingHours"
              value={clinicInfo.openingHours}
              onChange={(e) => handleChange('openingHours', e.target.value)}
              placeholder="Mon-Fri: 8am - 6pm"
              rows={4}
              className="font-mono text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between gap-3 pb-2">
        <Button variant="outline" onClick={handleReset} className="gap-2 bg-transparent">
          <RotateCcw className="size-4" />
          Reset
        </Button>
        <Button onClick={handleSave} className="gap-2">
          <Save className="size-4" />
          {saved ? 'Saved' : 'Save Changes'}
        </Button>
      </div>

      <Separator />

      {/* Footer */}
      <footer className="pb-6 text-center text-xs text-muted-foreground space-y-1">
        <p>
          Powered by{' '}
          <a
            href="http://silverantmarketing.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            Silver Ant Marketing
          </a>
        </p>
        <p>&copy; {new Date().getFullYear()} ClinicAnt. All rights reserved.</p>
      </footer>
    </div>
  )
}

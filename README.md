# **ClinicFlow**

**Run Your Clinic. Not Chaos.**

ClinicFlow is an operational intelligence system for veterinary clinics — combining patient management, workflows, and AI assistance into a single, cohesive platform.

It is designed for clinics that want **control, clarity, and scalability** — not fragmented tools.

---

## **What ClinicFlow Actually Does**

ClinicFlow is not just a CRM.

It is a **clinic operating system** that brings together:

* Patient records  
* Client relationships  
* Appointment workflows  
* Medical history tracking  
* AI-assisted operations

All in one structured system.

---

## **Core Philosophy**

Most veterinary clinics operate in **controlled chaos**:

* scattered records  
* manual follow-ups  
* inconsistent workflows

ClinicFlow replaces that with:

→ **structured workflows**  
→ **centralized data**  
→ **intelligent assistance**

---

## **Core Features**

### **Dashboard**

* Real-time operational overview  
* Daily appointments snapshot  
* Quick access to critical actions

---

### **Pets Management**

* Full lifecycle tracking of pets  
* Species-based filtering  
* Detailed medical history per pet  
* Linked ownership records

---

### **Client Management**

* Centralized owner directory  
* Full relationship mapping (owners ↔ pets)  
* Communication notes & history

---

### **Appointments**

* End-to-end scheduling system  
* Status tracking (Scheduled → Completed)  
* Appointment type categorization  
* Rapid updates for front-desk efficiency

---

### **Medical Records**

* Structured medical history system  
* Record types:  
  * Vaccinations  
  * Diagnoses  
  * Prescriptions  
  * Surgeries  
  * Lab results  
* Fully linked to patient profiles

---

### **AI Assistant**

* Context-aware clinic assistant  
* Supports multiple models  
* Configurable behavior via system prompts  
* Helps with:  
  * record summarization  
  * decision support  
  * operational queries

---

## **Architecture Overview**

ClinicFlow is built as a **modular, scalable system**:

* **Frontend:** Next.js 15 (App Router)  
* **UI:** Tailwind CSS \+ shadcn/ui  
* **State:** SWR  
* **AI Layer:** AI SDK  
* **Backend:** Extendable (currently mock → DB ready)

---

## **Deployment Model**

ClinicFlow is currently deployed as:

→ **Per-client isolated VPS deployments**

This ensures:

* data ownership  
* security  
* customization flexibility

Future roadmap includes **multi-tenant SaaS deployment**.

---

## **Project Structure**

* `/app` → core routes and pages  
* `/components` → modular UI system  
* `/lib` → data layer and utilities

Designed for:

* maintainability  
* extensibility  
* rapid iteration

---

## **Setup**

npm install  
npm run dev

Then open:

[http://localhost:3000](http://localhost:3000/)

---

## **Marketing Site**

The public marketing site for ClinicFlow is located in the `/marketing` directory. 
It is built with Vanilla HTML/JS and CSS for maximum performance and a premium feel.

To run the marketing site:
```bash
cd marketing
npm install
npm run dev
```

---

## **Database Integration**

To productionize:

1. Replace in-memory store with DB queries  
2. Map types from `/lib/types.ts`  
3. Configure environment variables

---

## **AI Configuration**

Customizable via Settings:

* Model selection  
* Temperature control  
* System prompts

This allows **clinic-specific intelligence tuning**.

---

## **Who This Is For**

ClinicFlow is built for:

* Independent veterinary clinics  
* Multi-location practices  
* Clinics moving from manual or fragmented systems

---

## **Roadmap Direction**

* Multi-tenant SaaS architecture  
* Advanced analytics & reporting  
* Workflow automation engine  
* Deeper AI integration

---

## **License**

Private

---

## **Final Note**

ClinicFlow is built with a simple principle:

Clinics should focus on care — not operational friction.

---

 
# Website Development Proposal - Qasida

## Client: [Client's Name]
## Prepared by: boutaleb

---

## **Project Overview**
This document outlines the details, features, and pricing for the development of a poetry website, including a public showcase of articles and an admin dashboard for content management and analytics.

---

## **Website Structure**

### **Global Elements (Present on All Pages)**
- **Header:**
  - Logo
  - Search button (opens modal to search through articles)
  - Menu button (opens navigation links to all pages)
- **Footer:**
  - Links to important pages
  - Social media links (if applicable)

### **Pages & Features**

#### **1. Homepage**
- **Section 1:** Welcome message and introduction
- **Section 2:** Article slider showcasing featured blog posts
- **Section 3:** Owner description and biography
- **Section 4:** Quick access links

#### **2. About Page**
- Detailed description of the website owner, their work, and mission
- **Comments Section:** Users can leave feedback or thoughts about the website owner

#### **3. Blog Page**
- Displays a gallery of articles
- Slider to navigate through highlighted articles
- Button to open a modal that lists all articles with filtering options

#### **4. Post Page (New Section)**
- Visitors can read full articles
- Users can interact by leaving **reviews, comments, and ratings**

#### **5. Contact Page**
- Contact details and information on how to reach out
- Contact form for inquiries (email-based communication)

#### **6. Login Page (Not in Menu)**
- Dedicated page for website owner/admin login
- Redirects to the admin dashboard

#### **7. Admin Dashboard** (Restricted Access)
- **Articles Management:**
  - Create, Read, Update, Delete (CRUD) functionality for articles
- **Analytics Section:**
  - View statistics and insights on website traffic and user engagement

---

## **Technology Stack**
- **Frontend:** Next.js (React Framework) with Tailwind CSS
- **Backend:** NestJS (Node.js Framework) with MongoDB
- **Database:** MongoDB Atlas
- **Hosting & Deployment:**
  - **Code Repository:** GitHub
  - **Hosting Platform:** Firebase

---

## **Development Timeline**

| Phase                  | Task Description                             | Estimated Time |
|------------------------|---------------------------------------------|---------------|
| **Phase 1:** Planning  | Gather requirements, finalize design         | 1 week        |
| **Phase 2:** Design    | Create UI mockups and structure layouts      | 1-2 weeks     |
| **Phase 3:** Development | Implement frontend, backend, and database   | 3-4 weeks     |
| **Phase 4:** Testing   | Debug, optimize, and review functionalities  | 1 week        |
| **Phase 5:** Deployment | Deploy and provide final client review      | 1 week        |

Total estimated time: **6-8 weeks**

---

## **Pricing Breakdown**

| Feature/Service         | Description                                      | Price (MAD) |
|------------------------|------------------------------------------------|------------|
| Website Design        | Custom UI/UX with responsive design            | 1000       |
| Homepage Development  | Implementation of homepage sections             | 500        |
| About Page            | Development of the about page + comments        | 300        |
| Blog Page             | Article gallery, slider, modal for filtering    | 750        |
| Post Page             | Full article view with comments, ratings        | 500        |
| Contact Page          | Contact form and reach-out details              | 250        |
| Authentication System | Secure login for admin access                   | 500        |
| Admin Dashboard      | CRUD for articles, analytics view                 | 1000       |
| Database Setup       | MongoDB Atlas configuration and integration      | 500        |
| Deployment           | GitHub + Firebase hosting setup                  | 500        |
| Testing & Optimization | Bug fixes, speed optimization                   | 200        |
| **Post-Delivery Support** | Updates and improvements after delivery       | 500        |
| **Total Cost:**       | **Complete development package**                | **5,000 MAD** |

---

## **Payment Plan**

| Payment Stage | Percentage | Amount (MAD) |
|--------------|------------|--------------|
| Initial Deposit (Before Starting) | 30% | 1,500 |
| Midway Payment (After Design & Part of Development) | 40% | 2,000 |
| Final Payment (Upon Project Completion) | 30% | 1,500 |
| **Total:** | **100%** | **5,000 MAD** |

---

## **Next Steps**

1. **Provide Branding Materials** – The client must provide the website logo, brand colors, and any images or graphics that should be used.
2. **Confirm Features & Design Preferences** – The client should review the proposed structure and provide any preferences or changes.
3. **Submit Articles & Content** – The client should send all initial articles, the bio for the About page, and any text for the homepage.
4. **Decide on Contact Information** – The client needs to specify which email(s) will be used for the contact form and how messages should be received.
5. **Provide Feedback During Development** – The client should be available to review progress and give feedback as required.
6. **Set Up Hosting Credentials (if needed)** – If the client wants to use a custom domain, they must provide access to their domain settings.
7. **Approve and Proceed with Payment Plan** – Once everything is set, the client must approve the project scope and agree on the payment terms.

For any modifications or additional features, pricing may be adjusted accordingly. Please confirm your approval so we can proceed.

---

**Prepared by:** [Your Name]  
**GitHub Repository:** [Project Link](https://github.com/ThranduilUrM0m/poetry.git)  
**Contact:** [Your Email]  

Thank you for considering this proposal! Looking forward to working with you.

# Project Handover Guide - Qasida

## 1. Transferring Firebase Project Ownership

To transfer the Firebase project to your client's Google account, follow these steps:

### **Add the Client as a Project Owner:**
1. Sign in to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project (`poetry`).
3. Click the **Settings** icon (⚙️) and choose **Users and Permissions**.
4. Click **Add Member**.
5. Enter the client's Google account email.
6. Set the role to **Project > Owner**.
7. Click **Add**.

### **Client Accepts the Invitation:**
- The client will receive an email invitation.
- They should accept the invitation to gain owner access.

### **Remove Your Access (Optional):**
- After confirming the client's ownership and ensuring everything functions correctly, you can remove your account from the project.

*Note:* Transferring ownership ensures that all Firebase services, including Firestore, Authentication, and Hosting, are accessible to the new owner. ([Support Docs](https://support.google.com/firebase/answer/7000272?hl=en))

---

## 2. Setting Up Billing Alerts in Google Cloud

To prevent unexpected charges and monitor usage, set up billing alerts:

### **Access the Billing Console:**
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Navigate to **Billing**.

### **Create a Budget:**
1. Select **Budgets & alerts**.
2. Click **Create Budget**.

### **Configure Budget Details:**
- **Name:** Enter a recognizable name (e.g., "Qasida Project Budget").
- **Scope:** Choose the project (`poetry`).
- **Amount:** Set your desired budget limit (e.g., $0 to receive alerts for any usage).

### **Set Alert Thresholds:**
- Define percentages at which you want to receive alerts (e.g., 50%, 90%, 100%).

### **Configure Notifications:**
- Specify email addresses to receive alerts.

### **Save the Budget:**
- Review and save your budget settings.

*Note:* Setting a budget does not cap the spending but sends alerts when thresholds are reached. To enforce spending limits, consider setting up programmatic notifications. ([Google Cloud Docs](https://cloud.google.com/billing/docs/how-to/budgets-programmatic-notifications))

---

## 3. Updating the Project Repository

After transferring ownership and setting up billing alerts, update the project repository to reflect these changes:

### **Clone the Repository:**
If not already done, clone the repository:
```bash
git clone https://github.com/ThranduilUrM0m/poetry.git
```

### **Update Configuration Files:**
- Ensure that all configuration files (e.g., `.env`, `firebaseConfig.js`) are updated with the client's Firebase project details.

### **Review Documentation:**
- Update any documentation to reflect the new project ownership and configuration.

### **Commit and Push Changes:**
```bash
git add .
git commit -m "Updated project ownership and configuration details"
git push origin main
```

---

## 4. Post-Transfer Checklist

- **Verify Access:** Ensure the client can access all necessary services in Firebase and Google Cloud.
- **Test Functionality:** Confirm that the application functions correctly under the new ownership.
- **Monitor Billing:** Regularly check billing reports to ensure no unexpected charges occur.

By following this guide, you can effectively transfer the project to your client, ensuring they have full control and are protected from unforeseen expenses. If you require further assistance, feel free to reach out.

<p align="center">
  <font size="6"><b>DonorFlow</b></font><br>
  <font size="4"><b>Empowering Kindness Through Giving</b></font>
</p>

---

<font size="5"><b>Members</b></font>
- **Phyu Mon Thant 6530224**
- **S Harry Lynn Oo 6530241**
- **Hein Htet Moe Tun 6530394**

<font size="5"><b>Overview</b></font>

**DonorFlow** is a full-stack charity and crowdfunding web application that connects **donors**, **receivers**, and **administrators** through a seamless giving experience.  
Users can contribute to fundraising campaigns, create their own campaigns, or manage donations and users through the admin panel.

---

<font size="5"><b>Features</b></font>

<font size="4"><b>Multi-Role System</b></font>
- **Donor** – Browse and contribute to campaigns, track donation history, and manage profile.  
- **Receiver (Fundraiser)** – Create, edit, and manage campaigns; view donation progress and approval status.  
- **Admin** – Oversee all campaigns, donations, categories, and users.

<font size="4"><b>Core Functionalities</b></font>

**Authentication & Role Selection**
- Sign up or log in as **Donor**, **Receiver**, or **Admin**.
- Intuitive onboarding modal guiding user choice.

**Donor Dashboard**
- Explore featured campaigns and category-based listings.
- Donate instantly with preset or custom amounts.
- Track all donation history in a dedicated History tab.
- Update profile and avatar via Profile page.

**Receiver (Fundraiser) Dashboard**
- Manage personal campaigns.
- Create new campaigns with image, description, goal, and category.
- Edit or delete existing campaigns.
- View progress and approval status.

**Admin Dashboard**
- Approve or reject campaigns.
- Manage categories, donations, and users.
- Monitor total raised amounts and campaign performance.

---

<font size="5"><b>User Flow Overview</b></font>

1. Landing Page → Choose to Contribute or Fundraise  
2. Login / Register → Role-based authentication  
3. Donor Flow  
   - Discover Campaigns → Donate → View History → Manage Profile  
4. Receiver Flow  
   - Access Campaign Center → Create/Edit Campaign → View Donations  
5. Admin Flow  
   - Approve/Reject Campaigns → Manage Categories & Users

---

<font size="5"><b>Tech Stack</b></font>

| Layer | Technology |
|-------|-------------|
| Frontend | Next.js (React) |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas |
| Styling | Tailwind CSS / Custom CSS Modules |
| Deployment | Azure VM (NGINX + PM2) |
| Image Hosting | Cloudinary |
| Authentication | JWT-based login with role-based access control |

---

<font size="5"><b>Installation & Setup</b></font>

**1. Clone the repository**
```bash
git clone https://github.com/yggf-jessica/donorflow.git
cd donorflow

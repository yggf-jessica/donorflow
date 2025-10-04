<p align="center">
  <h1 align="center"><b>DonorFlow</b></h1>
  <h3 align="center">Empowering Kindness Through Giving</h3>
</p>

---

## <b>Members</b>
- **Phyu Mon Thant 6530224**
- **S Harry Lynn Oo 6530241**
- **Hein Htet Moe Tun 6530394**

## <b>Overview</b>

**DonorFlow** is a full-stack charity and crowdfunding web application that connects **donors**, **receivers**, and **administrators** through a seamless giving experience.  
Users can contribute to fundraising campaigns, create their own campaigns, or manage donations and users through the admin panel.
<img width="1919" height="864" alt="Intro" src="https://github.com/user-attachments/assets/5dd7e52b-ee02-437f-aca5-ea9444cf9b3c" />

---

## <b>Features</b>

<font size="4"><b>Multi-Role System</b></font>
- **Donor** – Browse and contribute to campaigns, track donation history, and manage profile.  
- **Receiver (Fundraiser)** – Create, edit, and manage campaigns; view donation progress and approval status.  
- **Admin** – Oversee all campaigns, donations, categories, and users.

<font size="4"><b>Core Functionalities</b></font>

## **Authentication & Role Selection**
- Sign up or log in as **Donor**, **Receiver**, or **Admin**.
- Intuitive onboarding modal guiding user choice.
<img width="1919" height="865" alt="Login" src="https://github.com/user-attachments/assets/516c90dd-ab37-4a08-8bea-e52c3365a91d" />

## **Donor Dashboard**
- Explore featured campaigns and category-based listings.
- Donate instantly with preset or custom amounts.
- Track all donation history in a dedicated History tab.
- Update profile and avatar via Profile page.
<img width="1919" height="866" alt="DonorHome" src="https://github.com/user-attachments/assets/c4cd4efe-7dd9-4a75-8b02-73bc0df0d154" />
<img width="1919" height="868" alt="DonorHistory" src="https://github.com/user-attachments/assets/c9cdbc62-1766-4033-9d22-f34c89842b5f" />
<img width="1919" height="867" alt="DonorProfile" src="https://github.com/user-attachments/assets/9ecb4385-5099-4323-892c-4e36bfbe1f7b" />
<img width="1919" height="866" alt="DonationWindow" src="https://github.com/user-attachments/assets/ea4ea91e-d77f-44a7-8605-dd4a4dbb42f0" />

## **Receiver (Fundraiser) Dashboard**
- Manage personal campaigns.
- Create new campaigns with image, description, goal, and category.
- Edit or delete existing campaigns.
- View progress and approval status.
<img width="1919" height="865" alt="ReceiverHome" src="https://github.com/user-attachments/assets/c0fa6ac6-0d29-4d91-b4e1-05c675afb920" />
<img width="1919" height="867" alt="ReceiverCampaign" src="https://github.com/user-attachments/assets/7df6793e-ead9-4393-b694-6766c500b09f" />

## **Admin Dashboard**
- Approve or reject campaigns.
- Manage categories, donations, and users.
- Monitor total raised amounts and campaign performance.
<img width="1919" height="865" alt="AdminHome" src="https://github.com/user-attachments/assets/3b89529d-2115-4265-9508-a677504c90d5" />
<img width="1919" height="864" alt="AdminCategory" src="https://github.com/user-attachments/assets/98925960-d8d6-4011-9189-f222e0b7a2bb" />
<img width="1919" height="870" alt="AdminDonationList" src="https://github.com/user-attachments/assets/a046c3bf-725e-4532-af1c-741bb724fa30" />

---

## <b>User Flow Overview</b>

1. Landing Page → Choose to Contribute or Fundraise  
2. Login / Register → Role-based authentication  
3. Donor Flow  
   - Discover Campaigns → Donate → View History → Manage Profile  
4. Receiver Flow  
   - Access Campaign Center → Create/Edit Campaign → View Donations  
5. Admin Flow  
   - Approve/Reject Campaigns → Manage Categories & Users

---

## <b>Tech Stack</b>

| Layer | Technology |
|-------|-------------|
| Frontend | Next.js (React) |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas |
| Styling | Tailwind CSS / Custom CSS Modules |
| Deployment | Azure VM (NGINX + PM2) |
| Authentication | JWT-based login with role-based access control |

---

## <b>Installation & Setup</b>

```bash
# 1. Clone the repository
git clone https://github.com/yggf-jessica/donorflow.git
cd donorflow

# 2. Install dependencies (using pnpm)
npm install -g pnpm
pnpm install

# 3. Configure environment variables
# MongoDB database connection
MONGODB_URI=your_mongodb_connection_string

# JWT authentication secret
JWT_SECRET=your_jwt_secret_key

# Cloudinary image hosting
CLOUDINARY_URL=your_cloudinary_url

# API base URL for frontend
NEXT_PUBLIC_API_URL=http://your_server_ip_or_domain/api

# 4. Run development server
pnpm dev

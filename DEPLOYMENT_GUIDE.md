# 🚀 Deployment Guide - Holy Family Polymers

## ✅ Repository Successfully Pushed to GitHub

Your code is now ready for deployment on **Render**!

---

## 📋 **Step-by-Step Deployment on Render**

### **Prerequisites:**
- ✅ GitHub repository: `https://github.com/akhilstokes/holyfamilyprojectt.git`
- ✅ MongoDB Atlas account (free tier)
- ✅ Render account

---

### **1. Create MongoDB Database (if not already created)**

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free M0 cluster
3. Click **"Connect"** → **"Connect your application"**
4. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<username>` and `<password>` with your credentials

---

### **2. Deploy on Render**

#### **A. Sign Up / Login**
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Sign in with GitHub

#### **B. Create New Blueprint**
1. Click **"New +"** → **"Blueprint"**
2. Connect your GitHub account (if not connected)
3. Select repository: `akhilstokes/holyfamilyprojectt`
4. Render will detect `render.yaml` automatically
5. Click **"Apply"**

#### **C. Add Environment Variables**

**For Backend Service (`holy-family-polymers-backend`):**

| Variable | Value | Required |
|----------|-------|----------|
| `MONGO_URI` | `mongodb+srv://...` | ✅ Yes |
| `JWT_SECRET` | Random string (e.g., use: `openssl rand -hex 32`) | ✅ Yes |
| `GOOGLE_CLIENT_ID` | `484477736924-4gt8ieqt7pgs931f4i8g91ig1q2ipc3a.apps.googleusercontent.com` | ✅ Yes |
| `EMAIL_USER` | `your-email@gmail.com` | ✅ Yes |
| `EMAIL_PASS` | Gmail app password | ✅ Yes |
| `EMAIL_HOST` | `smtp.gmail.com` | Optional |
| `EMAIL_PORT` | `587` | Optional |
| `FRONTEND_URL` | `https://holy-family-polymers-frontend.onrender.com` | ✅ Yes |
| `PORT` | `5000` | Auto-set |
| `NODE_ENV` | `production` | Auto-set |

**For Frontend Service (`holy-family-polymers-frontend`):**

| Variable | Value |
|----------|-------|
| `BACKEND_URL` | `https://holy-family-polymers-backend.onrender.com` |

---

### **3. Monitor Deployment**

1. **Backend deploys first** (takes ~5-10 minutes)
   - Check build logs for errors
   - Wait for status: **"Live"**
   
2. **Frontend builds after backend**
   - Builds static React app
   - Deploys to CDN
   - Wait for status: **"Live"**

3. **Check Logs:**
   ```
   Click service → "Logs" tab
   ```

---

### **4. Verify Deployment**

#### **Test Backend:**
```bash
curl https://holy-family-polymers-backend.onrender.com/
# Should return: "Holy Family Polymers API is running..."
```

#### **Test Frontend:**
Visit: `https://holy-family-polymers-frontend.onrender.com`

#### **Test Login:**
- Email: `admin@xyz.com`
- Password: `admin@123`

---

## ⚙️ **Gmail App Password Setup**

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Security → **2-Step Verification** (enable if not already)
3. **App Passwords** → Select **"Mail"** and **"Other"**
4. Generate password
5. Copy the 16-character password
6. Use this as `EMAIL_PASS` in Render

---

## 🔥 **Free Tier Limitations**

### **Render Free Tier:**
- ✅ 750 hours/month free
- ⚠️ Service spins down after 15 min of inactivity
- ⚠️ Cold start: ~30s on first request
- ✅ Auto-deploy on git push

### **MongoDB Atlas Free Tier:**
- ✅ 512MB storage
- ✅ Shared cluster
- ✅ Perfect for testing/small apps

---

## 📊 **Post-Deployment Checklist**

- [ ] Backend is "Live"
- [ ] Frontend is "Live"
- [ ] MongoDB connection successful
- [ ] Login works
- [ ] WebSocket connections work
- [ ] Email sending works
- [ ] File uploads work
- [ ] Cron jobs running

---

## 🐛 **Troubleshooting**

### **Build Fails:**
```bash
# Check logs in Render dashboard
# Common issues:
- Missing environment variables
- MongoDB connection string incorrect
- Dependencies not installing
```

### **MongoDB Connection Error:**
```bash
# Verify:
1. MONGO_URI is correct
2. IP whitelist includes 0.0.0.0/0 (allow all)
3. Database user has read/write permissions
```

### **CORS Errors:**
```bash
# Already configured in server.js to accept:
- Render frontend URL
- Localhost (for development)
```

---

## 🎯 **Custom Domain (Optional)**

1. Go to frontend service in Render
2. Click **"Settings"** → **"Custom Domain"**
3. Add your domain
4. Update DNS records as shown

---

## 📝 **Update Deployment**

```bash
# Any push to main branch auto-deploys:
git add .
git commit -m "Update feature"
git push origin main

# Render automatically rebuilds and redeploys
```

---

## 🚨 **Important Notes**

1. **Never commit `.env` files** - They're in `.gitignore`
2. **Use environment variables** in Render dashboard
3. **Free tier spins down** - First request may be slow
4. **Monitor logs** during first deployment
5. **Test thoroughly** after deployment

---

## 🎉 **You're Live!**

Your application is now deployed and accessible worldwide!

- **Frontend**: `https://holy-family-polymers-frontend.onrender.com`
- **Backend**: `https://holy-family-polymers-backend.onrender.com`

---

## 📞 **Support**

If deployment fails:
1. Check Render logs
2. Verify environment variables
3. Test MongoDB connection
4. Review this guide again

Good luck! 🚀

# Company Rate Update Guide

## Overview
The company rate (₹/kg) is **dynamic** and stored in the database. It is NOT hardcoded and can be updated daily or whenever needed.

## How to Update the Company Rate

### From the Accountant Dashboard

1. **Navigate to**: Accountant Dashboard → **Verify Latex Billing** page

2. **View Current Rate**: 
   - At the top of the page, you'll see the current company rate displayed in a blue badge: `₹9000/kg`

3. **Update the Rate**:
   - Click the **"Update Rate"** button (on the right side)
   - An input field will appear with the current rate pre-filled
   - Enter the new rate (e.g., 8500, 9200, etc.)
   - Click **"Save"** to confirm
   - A confirmation dialog will appear showing the old and new rates
   - Click **"Update"** to apply the changes

4. **Cancel Updates**:
   - If you change your mind, click **"Cancel"** to return to the display mode

5. **Refresh Rate**:
   - Use the **"Refresh Rate"** button to reload the current rate from the database

## How It Works

### Database Storage
- The company rate is stored in the `rates` collection in MongoDB
- Each rate entry includes:
  - `companyRate`: The rate per kg
  - `status`: 'published' (active rates only)
  - `effectiveDate`: When the rate becomes effective
  - `createdBy`: User who created the rate
  - `updatedBy`: User who last updated the rate

### Rate Calculation
When the accountant calculates billing using the company rate, the system:
1. Fetches the latest published company rate from the database
2. Applies DRC-based pricing tiers:
   - **DRC ≥ 60%**: Full company rate (100%)
   - **DRC 50-59%**: 83% of company rate
   - **DRC 40-49%**: 67% of company rate
   - **DRC < 40%**: 50% of company rate
3. Calculates the final amount based on quantity and adjusted rate

## API Endpoints

### Get Company Rate
- **Endpoint**: `GET /api/rates/company`
- **Access**: Authenticated users
- **Response**: `{ rate: 9000 }`

### Update Company Rate
- **Endpoint**: `PUT /api/rates/company`
- **Access**: Admin or Manager roles only
- **Body**: `{ rate: 9000 }`
- **Response**: `{ message: 'Company rate updated successfully', rate: 9000 }`

## Important Notes

1. **Daily Updates**: You can update the rate as many times as needed - daily, hourly, or whenever market conditions change

2. **Historical Records**: Each rate update creates a new record in the database, preserving the history of rate changes

3. **Automatic Application**: Once updated, the new rate is immediately used for all new billing calculations

4. **Permission Required**: Only users with Admin or Manager roles can update the company rate

5. **Confirmation Required**: A confirmation dialog prevents accidental rate changes

## Example Workflow

**Morning Update Scenario:**
```
1. Check today's market rate: ₹9000/kg
2. Navigate to Verify Latex Billing page
3. Current rate shows: ₹8500/kg
4. Click "Update Rate"
5. Enter new rate: 9000
6. Click "Save" → Confirm "Update"
7. Success! Rate now shows: ₹9000/kg
8. All new calculations will use ₹9000/kg
```

## Troubleshooting

### Rate Not Updating?
- Ensure you have Admin or Manager role permissions
- Check that you entered a valid number greater than 0
- Try clicking "Refresh Rate" to reload from database

### Old Rate Still Showing?
- Click the "Refresh Rate" button
- Refresh your browser page
- Clear browser cache if needed

## Support
If you encounter any issues updating the company rate, contact your system administrator.


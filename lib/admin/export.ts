import { createClient } from '@/lib/supabase/client'
import Papa from 'papaparse'
import { jsPDF } from 'jspdf'

/**
 * Export artisans to CSV
 */
export async function exportArtisansToCSV(filters: any = {}) {
    const supabase = createClient()

    let query = supabase
        .from('artisan_profiles')
        .select('*')

    // Apply filters
    if (filters.status) query = query.eq('status', filters.status)
    if (filters.category) query = query.eq('category', filters.category)
    if (filters.is_verified !== undefined) query = query.eq('is_verified', filters.is_verified)
    if (filters.estate_zone) query = query.eq('estate_zone', filters.estate_zone)

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
        console.error('Failed to fetch artisans for export:', error)
        throw error
    }

    // Format data for CSV
    const csvData = data.map(artisan => ({
        'Business Name': artisan.business_name,
        'Artisan Name': artisan.artisan_name,
        'Phone': artisan.phone_number,
        'WhatsApp': artisan.whatsapp_number || '',
        'Category': artisan.category,
        'Experience (Years)': artisan.experience_years,
        'Estate/Zone': artisan.estate_zone,
        'City': artisan.city,
        'State': artisan.state,
        'Rating': artisan.rating,
        'Total Reviews': artisan.total_reviews,
        'Total Contacts': artisan.total_contacts,
        'Status': artisan.status,
        'Verified': artisan.is_verified ? 'Yes' : 'No',
        'Verification Method': artisan.verification_method || '',
        'Created At': new Date(artisan.created_at).toLocaleDateString()
    }))

    // Generate CSV
    const csv = Papa.unparse(csvData)

    // Download CSV
    downloadFile(csv, `artisans_export_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv')

    return csvData.length
}

/**
 * Export reviews to CSV
 */
export async function exportReviewsToCSV(filters: any = {}) {
    const supabase = createClient()

    let query = supabase
        .from('reviews')
        .select(`
      *,
      artisan:artisan_profiles(business_name, artisan_name)
    `)

    // Apply filters
    if (filters.status) query = query.eq('status', filters.status)
    if (filters.artisan_id) query = query.eq('artisan_id', filters.artisan_id)
    if (filters.startDate) query = query.gte('created_at', filters.startDate)
    if (filters.endDate) query = query.lte('created_at', filters.endDate)

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
        console.error('Failed to fetch reviews for export:', error)
        throw error
    }

    // Format data for CSV
    const csvData = data.map(review => ({
        'Artisan': review.artisan?.business_name || 'Unknown',
        'Rating': review.rating,
        'Comment': review.comment,
        'Verified Hire': review.is_verified_hire ? 'Yes' : 'No',
        'Status': review.status,
        'Created At': new Date(review.created_at).toLocaleDateString(),
        'Moderated At': review.moderated_at ? new Date(review.moderated_at).toLocaleDateString() : ''
    }))

    // Generate CSV
    const csv = Papa.unparse(csvData)

    // Download CSV
    downloadFile(csv, `reviews_export_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv')

    return csvData.length
}

/**
 * Export contact events to CSV
 */
export async function exportContactsToCSV(filters: any = {}) {
    const supabase = createClient()

    let query = supabase
        .from('contact_events')
        .select(`
      *,
      artisan:artisan_profiles(business_name, artisan_name)
    `)

    // Apply filters
    if (filters.artisan_id) query = query.eq('artisan_id', filters.artisan_id)
    if (filters.contact_type) query = query.eq('contact_type', filters.contact_type)
    if (filters.startDate) query = query.gte('contacted_at', filters.startDate)
    if (filters.endDate) query = query.lte('contacted_at', filters.endDate)

    const { data, error } = await query.order('contacted_at', { ascending: false })

    if (error) {
        console.error('Failed to fetch contacts for export:', error)
        throw error
    }

    // Format data for CSV
    const csvData = data.map(contact => ({
        'Artisan': contact.artisan?.business_name || 'Unknown',
        'Contact Type': contact.contact_type,
        'Contacted At': new Date(contact.contacted_at).toLocaleString(),
        'Review Submitted': contact.review_submitted ? 'Yes' : 'No',
        'Review Requested At': contact.review_requested_at ? new Date(contact.review_requested_at).toLocaleString() : ''
    }))

    // Generate CSV
    const csv = Papa.unparse(csvData)

    // Download CSV
    downloadFile(csv, `contacts_export_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv')

    return csvData.length
}

/**
 * Export audit logs to CSV
 */
export async function exportAuditLogsToCSV(filters: any = {}) {
    const supabase = createClient()

    let query = supabase
        .from('admin_audit_logs')
        .select('*')

    // Apply filters
    if (filters.admin_user_id) query = query.eq('admin_user_id', filters.admin_user_id)
    if (filters.action_type) query = query.eq('action_type', filters.action_type)
    if (filters.startDate) query = query.gte('created_at', filters.startDate)
    if (filters.endDate) query = query.lte('created_at', filters.endDate)

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
        console.error('Failed to fetch audit logs for export:', error)
        throw error
    }

    // Format data for CSV
    const csvData = data.map(log => ({
        'Admin User ID': log.admin_user_id,
        'Action': log.action_type,
        'Target Type': log.target_type || '',
        'Target ID': log.target_id || '',
        'Details': JSON.stringify(log.details),
        'IP Address': log.ip_address || '',
        'Created At': new Date(log.created_at).toLocaleString()
    }))

    // Generate CSV
    const csv = Papa.unparse(csvData)

    // Download CSV
    downloadFile(csv, `audit_logs_export_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv')

    return csvData.length
}

/**
 * Generate monthly summary PDF report
 */
export async function generateMonthlySummaryPDF(month: string, year: string) {
    const supabase = createClient()

    // Calculate date range
    const startDate = new Date(`${year}-${month}-01`)
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + 1)

    // Fetch data for the month
    const [artisansRes, reviewsRes, contactsRes] = await Promise.all([
        supabase
            .from('artisan_profiles')
            .select('*')
            .gte('created_at', startDate.toISOString())
            .lt('created_at', endDate.toISOString()),
        supabase
            .from('reviews')
            .select('*')
            .eq('status', 'approved')
            .gte('created_at', startDate.toISOString())
            .lt('created_at', endDate.toISOString()),
        supabase
            .from('contact_events')
            .select('*')
            .gte('contacted_at', startDate.toISOString())
            .lt('contacted_at', endDate.toISOString())
    ])

    const newArtisans = artisansRes.data || []
    const newReviews = reviewsRes.data || []
    const newContacts = contactsRes.data || []

    // Calculate metrics
    const avgRating = newReviews.length > 0
        ? (newReviews.reduce((sum, r) => sum + r.rating, 0) / newReviews.length).toFixed(2)
        : '0.00'

    // Create PDF
    const doc = new jsPDF()

    // Title
    doc.setFontSize(20)
    doc.text('Artisan Connect - Monthly Summary', 20, 20)

    doc.setFontSize(12)
    doc.text(`Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`, 20, 30)

    // Summary stats
    doc.setFontSize(14)
    doc.text('Summary Statistics', 20, 45)

    doc.setFontSize(11)
    doc.text(`New Artisans: ${newArtisans.length}`, 30, 55)
    doc.text(`New Reviews: ${newReviews.length}`, 30, 62)
    doc.text(`Contact Events: ${newContacts.length}`, 30, 69)
    doc.text(`Average Rating: ${avgRating} / 5.0`, 30, 76)

    // Category breakdown
    const categoryCount: Record<string, number> = {}
    newArtisans.forEach(a => {
        categoryCount[a.category] = (categoryCount[a.category] || 0) + 1
    })

    doc.setFontSize(14)
    doc.text('New Artisans by Category', 20, 90)

    doc.setFontSize(11)
    let yPos = 100
    Object.entries(categoryCount).forEach(([category, count]) => {
        doc.text(`${category}: ${count}`, 30, yPos)
        yPos += 7
    })

    // Footer
    doc.setFontSize(9)
    doc.text(`Generated on ${new Date().toLocaleString()}`, 20, 280)

    // Download PDF
    doc.save(`artisan_connect_summary_${year}_${month}.pdf`)
}

/**
 * Helper function to download a file
 */
function downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

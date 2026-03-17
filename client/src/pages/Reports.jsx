import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  Users, 
  ShoppingCart,
  DollarSign,
  Package,
  Filter,
  BarChart3,
  PieChart
} from 'lucide-react'

const Reports = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })
  const [reportType, setReportType] = useState('sales')
  const [generatedReport, setGeneratedReport] = useState(null)

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login')
      return
    }
    fetchReports()
  }, [user, navigate])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const res = await axios.get('/api/reports')
      setReports(res.data)
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateReport = async () => {
    try {
      setLoading(true)
      const res = await axios.post('/api/reports/generate', {
        type: reportType,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      })
      setGeneratedReport(res.data)
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  const downloadReport = async (reportId, format) => {
    try {
      const res = await axios.get(`/api/reports/${reportId}/download?format=${format}&type=${reportType}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`, {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `report-${reportId}.${format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Error downloading report:', error)
      alert('Failed to download report')
    }
  }

  const getReportIcon = (type) => {
    switch (type) {
      case 'sales': return <DollarSign className="text-green-600" />
      case 'orders': return <ShoppingCart className="text-blue-600" />
      case 'products': return <Package className="text-purple-600" />
      case 'customers': return <Users className="text-orange-600" />
      default: return <FileText className="text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
        <p className="mt-4">Loading reports...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dynamic Reports</h1>
          <p className="text-gray-600 mt-2">Generate and download business reports</p>
        </div>
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="btn-secondary"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Report Generation Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText size={24} />
          Generate New Report
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="sales">Sales Report</option>
              <option value="orders">Orders Report</option>
              <option value="products">Products Report</option>
              <option value="customers">Customers Report</option>
              <option value="inventory">Inventory Report</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>
        
        <button
          onClick={generateReport}
          disabled={loading}
          className="btn-primary flex items-center gap-2"
        >
          <BarChart3 size={20} />
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
      </div>

      {/* Generated Report Preview */}
      {generatedReport && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Report Preview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-600">Total Records</p>
              <p className="text-2xl font-bold">{generatedReport.totalRecords || 0}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold">₹{generatedReport.totalAmount || 0}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-600">Average Order</p>
              <p className="text-2xl font-bold">₹{generatedReport.averageOrder || 0}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-600">Generated</p>
              <p className="text-2xl font-bold">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => downloadReport(generatedReport.id, 'pdf')}
              className="btn-secondary flex items-center gap-2"
            >
              <Download size={16} />
              Download PDF
            </button>
            <button
              onClick={() => downloadReport(generatedReport.id, 'excel')}
              className="btn-secondary flex items-center gap-2"
            >
              <Download size={16} />
              Download Excel
            </button>
            <button
              onClick={() => downloadReport(generatedReport.id, 'csv')}
              className="btn-secondary flex items-center gap-2"
            >
              <Download size={16} />
              Download CSV
            </button>
          </div>
        </div>
      )}

      {/* Previous Reports */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Calendar size={24} />
          Previous Reports
        </h2>
        
        {reports.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No reports generated yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Type</th>
                  <th className="text-left py-3 px-4">Date Range</th>
                  <th className="text-left py-3 px-4">Generated</th>
                  <th className="text-left py-3 px-4">Records</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getReportIcon(report.type)}
                        <span className="capitalize">{report.type}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {new Date(report.startDate).toLocaleDateString()} - {new Date(report.endDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">{report.totalRecords}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => downloadReport(report._id, 'pdf')}
                          className="text-blue-600 hover:text-blue-800"
                          title="Download PDF"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={() => downloadReport(report._id, 'excel')}
                          className="text-green-600 hover:text-green-800"
                          title="Download Excel"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={() => downloadReport(report._id, 'csv')}
                          className="text-purple-600 hover:text-purple-800"
                          title="Download CSV"
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Reports

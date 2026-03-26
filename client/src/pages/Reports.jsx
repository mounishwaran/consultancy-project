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
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })
  const [reportType, setReportType] = useState('sales')
  const [generatedReport, setGeneratedReport] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login')
      return
    }
  }, [user, navigate])

  const generateReport = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/reports/generate`,
        {
          type: reportType,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      
      console.log('Report generated:', res.data)
      setGeneratedReport(res.data)
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  const downloadReport = async (format) => {
    try {
      const token = localStorage.getItem('token')

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/reports/download?format=${format}&type=${reportType}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
        {
          responseType: 'blob',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `report-${Date.now()}.${format === 'excel' ? 'csv' : format}`)
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
        <p className="mt-4">Generating report...</p>
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
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
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
              <p className="text-2xl font-bold">Rs. {generatedReport.totalAmount || 0}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-600">Average Order</p>
              <p className="text-2xl font-bold">Rs. {generatedReport.averageOrder || 0}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-600">Generated</p>
              <p className="text-2xl font-bold">{new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => downloadReport('pdf')}
              className="btn-secondary flex items-center gap-2"
            >
              <Download size={16} />
              Download PDF
            </button>
            <button
              onClick={() => downloadReport('excel')}
              className="btn-secondary flex items-center gap-2"
            >
              <Download size={16} />
              Download Excel
            </button>
            <button
              onClick={() => downloadReport('csv')}
              className="btn-secondary flex items-center gap-2"
            >
              <Download size={16} />
              Download CSV
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Reports

import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

type LiftType = 'squat' | 'bench' | 'deadlift';

interface LiftData {
  liftType: LiftType;
  weight: number;
  reps: number;
  date: string;
}

interface LiftHistoryItem {
  id?: number;
  liftType: LiftType;
  weight: number;
  reps: number;
  date: string;
}

function App() {
  // Lift logging state
  const [liftType, setLiftType] = useState<LiftType>('squat');
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Video upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [enableAI, setEnableAI] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  // Lift history state
  const [lifts, setLifts] = useState<LiftHistoryItem[]>([]);
  const [isLoadingLifts, setIsLoadingLifts] = useState(false);

  // Navigation state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'log-lift' | 'upload-video' | 'history'>('dashboard');

  // Fetch lifts from API
  const fetchLifts = async () => {
    setIsLoadingLifts(true);
    try {
      const response = await fetch('/lifts');
      if (response.ok) {
        const data = await response.json();
        setLifts(data);
      } else {
        console.error('Failed to fetch lifts');
      }
    } catch (error) {
      console.error('Error fetching lifts:', error);
    } finally {
      setIsLoadingLifts(false);
    }
  };

  // Fetch lifts on component mount
  useEffect(() => {
    fetchLifts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const liftData: LiftData = {
        liftType,
        weight: parseFloat(weight),
        reps: parseInt(reps),
        date
      };

      const response = await fetch('/log_lift', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(liftData),
      });

      if (response.ok) {
        setMessage("Lift logged successfully!");
        // Reset form
        setWeight("");
        setReps("");
        setDate(new Date().toISOString().split('T')[0]);
        // Refresh lifts table
        fetchLifts();
      } else {
        setMessage("Failed to log lift. Please try again.");
      }
    } catch (error) {
      setMessage("Error: Could not connect to server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setUploadMessage("Please select a video file to upload.");
      return;
    }

    setIsUploading(true);
    setUploadMessage("");

    try {
      const formData = new FormData();
      formData.append('video', selectedFile);
      formData.append('enableAI', enableAI.toString());

      const response = await fetch('/upload_video', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setUploadMessage("Video uploaded successfully!");
        setSelectedFile(null);
        // Reset file input
        const fileInput = document.getElementById('video-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        setUploadMessage("Failed to upload video. Please try again.");
      }
    } catch (error) {
      setUploadMessage("Error: Could not connect to server.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm'];
      if (validTypes.includes(file.type)) {
        setSelectedFile(file);
        setUploadMessage("");
      } else {
        setUploadMessage("Please select a valid video file (MP4, AVI, MOV, WMV, WebM).");
        e.target.value = '';
      }
    }
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Welcome to PowerLift Pro</h2>
        <p className="text-xl mb-6">Track your powerlifting journey with precision and AI-powered insights</p>
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-2xl mb-2">🏋️‍♂️</div>
            <h3 className="font-semibold">Track Lifts</h3>
            <p className="text-sm opacity-90">Log your squat, bench, and deadlift sessions</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-2xl mb-2">🎥</div>
            <h3 className="font-semibold">Video Analysis</h3>
            <p className="text-sm opacity-90">Upload videos for AI-powered form feedback</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-2xl mb-2">📈</div>
            <h3 className="font-semibold">Progress Tracking</h3>
            <p className="text-sm opacity-90">Monitor your strength gains over time</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Lifts</p>
              <p className="text-2xl font-bold text-gray-900">{lifts.length}</p>
            </div>
            <div className="text-3xl">🏋️‍♂️</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {lifts.filter(lift => {
                  const liftDate = new Date(lift.date);
                  const now = new Date();
                  return liftDate.getMonth() === now.getMonth() && liftDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
            <div className="text-3xl">📅</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Max Weight</p>
              <p className="text-2xl font-bold text-gray-900">
                {lifts.length > 0 ? Math.max(...lifts.map(lift => lift.weight)) : 0} kg
              </p>
            </div>
            <div className="text-3xl">💪</div>
          </div>
        </div>
      </div>

      {/* Recent Lifts Preview */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Recent Lifts</h3>
          <button 
            onClick={() => setActiveTab('history')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View All →
          </button>
        </div>
        <div className="p-6">
          {lifts.slice(0, 3).length > 0 ? (
            <div className="space-y-3">
              {lifts.slice(0, 3).map((lift, index) => (
                <div key={lift.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">
                      {lift.liftType === 'squat' && '🏋️‍♂️'}
                      {lift.liftType === 'bench' && '💪'}
                      {lift.liftType === 'deadlift' && '🔥'}
                    </span>
                    <div>
                      <p className="font-medium capitalize">
                        {lift.liftType === 'bench' ? 'Bench Press' : lift.liftType}
                      </p>
                      <p className="text-sm text-gray-600">{new Date(lift.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{lift.weight} kg</p>
                    <p className="text-sm text-gray-600">{lift.reps} reps</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No lifts logged yet. Start tracking your progress!</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderLogLift = () => (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">📊 Log Your Lift</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
        {/* Lift Type Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lift Type
          </label>
          <select
            className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={liftType}
            onChange={(e) => setLiftType(e.target.value as LiftType)}
          >
            <option value="squat">Squat</option>
            <option value="bench">Bench Press</option>
            <option value="deadlift">Deadlift</option>
          </select>
        </div>

        {/* Weight Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Weight (kg)
          </label>
          <input
            type="number"
            step="0.5"
            className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter weight"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            required
          />
        </div>

        {/* Reps Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reps
          </label>
          <input
            type="number"
            min="1"
            className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter reps"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            required
          />
        </div>

        {/* Date Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
            } text-white`}
          >
            {isLoading ? 'Logging...' : 'Log Lift'}
          </button>

          {/* Message Display */}
          {message && (
            <div className={`p-3 rounded-md text-center ${
              message.includes('successfully') 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );

  const renderUploadVideo = () => (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">🎥 Upload Video</h2>
        <form onSubmit={handleVideoUpload} className="space-y-6">
              {/* File Upload Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Video File
                </label>
                <input
                  id="video-upload"
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {selectedFile && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              {/* AI Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  AI Analysis
                </label>
                <select
                  className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={enableAI ? 'enabled' : 'disabled'}
                  onChange={(e) => setEnableAI(e.target.value === 'enabled')}
                >
                  <option value="enabled">🤖 Enable AI Analysis</option>
                  <option value="disabled">🚫 No AI Analysis</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  AI analysis will provide form feedback and lift detection
                </p>
              </div>

              {/* Upload Button */}
              <button
                type="submit"
                disabled={isUploading || !selectedFile}
                className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                  isUploading || !selectedFile
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500'
                } text-white`}
              >
                {isUploading ? 'Uploading...' : 'Upload Video'}
              </button>

          {/* Upload Message Display */}
          {uploadMessage && (
            <div className={`p-3 rounded-md text-center ${
              uploadMessage.includes('successfully') 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {uploadMessage}
            </div>
          )}
        </form>
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">📈 Lift History</h2>
        <p className="text-gray-600 mt-1">Complete record of all your logged lifts</p>
      </div>
      
      {isLoadingLifts ? (
        <div className="p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading your lift history...</p>
        </div>
      ) : lifts.length === 0 ? (
        <div className="p-12 text-center text-gray-500">
          <div className="text-6xl mb-4">🏋️‍♂️</div>
          <h3 className="text-lg font-medium mb-2">No lifts logged yet</h3>
          <p className="mb-4">Start tracking your powerlifting journey!</p>
          <button 
            onClick={() => setActiveTab('log-lift')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Log Your First Lift
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lift Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Weight (kg)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reps
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {lifts.map((lift, index) => (
                <tr key={lift.id || index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">
                        {lift.liftType === 'squat' && '🏋️‍♂️'}
                        {lift.liftType === 'bench' && '💪'}
                        {lift.liftType === 'deadlift' && '🔥'}
                      </span>
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {lift.liftType === 'bench' ? 'Bench Press' : lift.liftType}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {lift.weight} kg
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lift.reps}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(lift.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="text-2xl font-bold text-gray-900">
                💪 <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">PowerLift Pro</span>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: '📊' },
                { id: 'log-lift', label: 'Log Lift', icon: '🏋️‍♂️' },
                { id: 'upload-video', label: 'Upload Video', icon: '🎥' },
                { id: 'history', label: 'History', icon: '📈' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button className="text-gray-600 hover:text-gray-900">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white border-b border-gray-200">
        <div className="px-4 py-2 space-y-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'log-lift', label: 'Log Lift', icon: '🏋️‍♂️' },
            { id: 'upload-video', label: 'Upload Video', icon: '🎥' },
            { id: 'history', label: 'History', icon: '📈' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'log-lift' && renderLogLift()}
        {activeTab === 'upload-video' && renderUploadVideo()}
        {activeTab === 'history' && renderHistory()}
      </main>
    </div>
  );
}

export default App;
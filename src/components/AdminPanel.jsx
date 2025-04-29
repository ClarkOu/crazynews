import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const AdminPanel = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

  const triggerCrawl = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/admin/crawl-now`, {
        method: 'POST',
      });
      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      setMessage('操作失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-panel">
      <h1>管理面板</h1>
      
      <div className="panel-section">
        <h2>爬虫控制</h2>
        <button 
          onClick={triggerCrawl} 
          disabled={loading}
        >
          {loading ? '处理中...' : '立即执行爬虫任务'}
        </button>
        {message && <p className="message">{message}</p>}
      </div>
      
      <Link to="/" className="back-link">返回首页</Link>
    </div>
  );
};

export default AdminPanel;
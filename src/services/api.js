// src/services/api.js
// 使用环境变量定义基础URL，注意这里不再包含 /api，因为环境变量里已经有了
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api'; 

// 添加调试日志
function logApiCall(method, url, params = null) {
  console.group(`🔄 API ${method}: ${url}`);
  if (params) console.log('请求参数:', params);
  console.groupEnd();
}

export const fetchNews = async (params = {}) => {
  // 路径现在相对于 API_BASE_URL
  const path = '/news'; 
  
  const queryParams = new URLSearchParams();
  
  if (params.category) queryParams.append('category', params.category);
  if (params.minScore) queryParams.append('min_score', params.minScore); 
  if (params.days) queryParams.append('days', params.days);
  if (params.skip) queryParams.append('skip', params.skip);
  if (params.limit) queryParams.append('limit', params.limit);
  
  // 拼接完整的URL
  const url = `${API_BASE_URL}${path}?${queryParams.toString()}`;
  logApiCall('GET', url, params);
  
  try {
    const response = await fetch(url,{
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    });
    console.log('📡 API响应状态:', response.status);
    
    if (!response.ok) {
      throw new Error(`API错误(${response.status}): ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('📦 API返回数据:', data);
    
    return data;
  } catch (err) {
    console.error('❌ API请求失败:', err);
    throw err;
  }
};

export const fetchNewsDetail = async (id) => {
  // 路径现在相对于 API_BASE_URL
  const path = `/news/${id}`;
  const url = `${API_BASE_URL}${path}`;
  logApiCall('GET', url);
  
  try {
    const response = await fetch(url,{
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    });
    console.log('📡 API响应状态:', response.status);
    
    if (!response.ok) {
      throw new Error(`API错误(${response.status}): ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('📦 API返回数据:', data);
    
    return data;
  } catch (err) {
    console.error('❌ API请求失败:', err);
    throw err;
  }
};

export const fetchCategories = async () => {
  // 路径现在相对于 API_BASE_URL
  const path = '/categories';
  const url = `${API_BASE_URL}${path}`;
  logApiCall('GET', url);
  
  try {
    const response = await fetch(url,{
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    });
    console.log('📡 API响应状态:', response.status);
    
    if (!response.ok) {
      throw new Error(`API错误(${response.status}): ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('📦 API返回数据:', data);
    
    return data;
  } catch (err) {
    console.error('❌ API请求失败:', err);
    throw err;
  }
};

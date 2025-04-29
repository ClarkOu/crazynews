import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { fetchNews, fetchCategories } from '../services/api';
import NewsList from './NewsList'; // 假设 NewsList 存在
import FilterPanel from './FilterPanel'; // 假设 FilterPanel 存在
// import LoadingSpinner from './LoadingSpinner'; // <-- 移除
// import ErrorMessage from './ErrorMessage'; // <-- 移除
// import Layout from './Layout'; // <-- 保持移除

const MainContent = () => {
  const [news, setNews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const getFiltersFromParams = useCallback(() => {
    return {
      category: searchParams.get('category') || 'all',
      minScore: parseInt(searchParams.get('minScore') || '0', 10),
      days: parseInt(searchParams.get('days') || '7', 10),
    };
  }, [searchParams]);

  const [filters, setFilters] = useState(getFiltersFromParams);

  useEffect(() => {
    setFilters(getFiltersFromParams());
  }, [location.search, getFiltersFromParams]);

  const loadNews = useCallback(async (currentFilters) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        category: currentFilters.category === 'all' ? null : currentFilters.category,
        minScore: currentFilters.minScore,
        days: currentFilters.days,
      };
      const data = await fetchNews(params);
      setNews(data);
    } catch (err) {
      setError('无法加载新闻数据，请稍后再试。');
      console.error("Error loading news:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const cats = await fetchCategories();
      setCategories([{ id: 'all', name: '全部类别' }, ...cats]);
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  }, []);

  useEffect(() => {
    loadNews(filters);
  }, [filters, loadNews]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleFilterChange = (newFilters) => {
    const params = {
      category: newFilters.category,
      minScore: newFilters.minScore.toString(),
      days: newFilters.days.toString(),
    };
    setSearchParams(params);
  };

  return (
    <>
      {/* --- 添加这个测试标题 --- */}
      <h1>测试标题 - MainContent</h1>
      {/* --- 结束添加 --- */}

      <FilterPanel
        categories={categories}
        currentFilters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* --- 使用简单的文本显示错误 --- */}
      {error && <p style={{ color: 'red', margin: '1rem 0' }}>错误: {error}</p>}

      {/* --- 使用简单的文本显示加载状态 --- */}
      {loading ? (
        <p style={{ margin: '1rem 0' }}>加载中...</p>
      ) : (
        <NewsList news={news} />
      )}
    </>
  );
};

export default MainContent;

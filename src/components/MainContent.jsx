import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { fetchNews, fetchCategories } from '../services/api';
import NewsList from './NewsList';
import FilterPanel from './FilterPanel';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import Layout from './Layout'; // 确保 Layout 已导入

const MainContent = () => {
  const [news, setNews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // 从 URL 参数或默认值获取过滤条件
  const getFiltersFromParams = useCallback(() => {
    return {
      category: searchParams.get('category') || 'all',
      minScore: parseInt(searchParams.get('minScore') || '0', 10),
      days: parseInt(searchParams.get('days') || '7', 10),
    };
  }, [searchParams]);

  const [filters, setFilters] = useState(getFiltersFromParams);

  // 当 URL 参数变化时更新本地 filters 状态
  useEffect(() => {
    setFilters(getFiltersFromParams());
  }, [location.search, getFiltersFromParams]); // 依赖 location.search 来检测 URL 变化


  const loadNews = useCallback(async (page, currentFilters) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        category: currentFilters.category === 'all' ? null : currentFilters.category,
        minScore: currentFilters.minScore,
        days: currentFilters.days,
      };
      // 注意：实际应用中 API 需要支持分页参数 (limit, skip) 并返回总条目数或总页数
      const data = await fetchNews(params);
      setNews(data);
    } catch (err) {
      setError('无法加载新闻数据，请稍后再试。');
      console.error("Error loading news:", err);
    } finally {
      setLoading(false);
    }
  }, []); // 移除 filters 依赖，改为从参数传入

  const loadCategories = useCallback(async () => {
    try {
      const cats = await fetchCategories();
      setCategories([{ id: 'all', name: '全部类别' }, ...cats]);
    } catch (err) {
      console.error("Error loading categories:", err);
      // 可以选择设置一个错误状态或显示提示
    }
  }, []);

  // 初始加载和当 filters 或 currentPage 变化时重新加载新闻
  useEffect(() => {
    loadNews(currentPage, filters);
  }, [currentPage, filters, loadNews]); // 依赖 currentPage 和 filters

  // 初始加载类别
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleFilterChange = (newFilters) => {
     // 更新 URL 参数，并将页码重置为 1
    const params = {
      category: newFilters.category,
      minScore: newFilters.minScore.toString(),
      days: newFilters.days.toString(),
    };
    setSearchParams(params);
    // 注意：状态更新将由上面的 useEffect(() => { setFilters... }, [location.search]) 处理
  };


  return (
    <Layout> {/* 使用 Layout 包裹 */}
      {/* --- 添加这个测试标题 --- */}
      <h1>测试标题 - MainContent</h1>
      {/* --- 结束添加 --- */}
      <FilterPanel
        categories={categories}
        currentFilters={filters}
        onFilterChange={handleFilterChange}
      />
      {error && <ErrorMessage message={error} />}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <NewsList news={news} />
        </>
      )}
    </Layout>
  );
};

export default MainContent;

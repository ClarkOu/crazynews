import React, { useState, useEffect, useCallback } from 'react'; // 导入 useCallback
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import NewsCard from './components/NewsCard';
import FilterPanel from './components/FilterPanel';
import ApiDebugTool from './components/ApiDebugTool';
import UrlCrawler from './components/UrlCrawler';
import AdminPanel from './components/AdminPanel';
import { fetchNews, fetchCategories } from './services/api'; 
import './App.css';

// --- MainContent 定义保持不变 ---
const MainContent = ({
  news,
  loading,
  error,
  category,
  availableCategories,
  hasMore,
  filters,
  handleFilterChange,
  handleCategoryChange,
  loadMore,
  displayCount, // 传递 displayCount 用于调试或显示
  allNewsCount // 传递 allNewsCount 用于调试或显示
}) => {
  return (
    <Layout>
      <FilterPanel 
         filters={filters} 
         onFilterChange={handleFilterChange} 
      />
      <div className="category-nav" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', display: 'flex', gap: '0.5rem' }}>
         <button 
           className={`category-btn ${category === 'all' ? 'active' : ''}`}
           onClick={() => handleCategoryChange('all')}>
           全部
         </button>
         {availableCategories.map(cat => (
           <button 
             key={cat.id} 
             className={`category-btn ${category === cat.name ? 'active' : ''}`}
             onClick={() => handleCategoryChange(cat.name)}>
             {cat.name}
           </button>
         ))}
       </div>
          
      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

      {/* 可以选择性显示调试信息 */}
      {/* <div style={{fontSize: '0.8rem', color: 'gray', marginBottom: '1rem'}}>
        显示: {displayCount} / {allNewsCount} | 还有更多: {hasMore ? '是' : '否'} | 加载中: {loading ? '是' : '否'}
      </div> */}

      <div className="news-container">
        {loading && news.length === 0 ? (
          <div className="loading-skeleton">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-title"></div>
                <div className="skeleton-meta"></div>
              </div>
            ))}
          </div>
        ) : news.length > 0 ? (
          news.map((item) => (
            <NewsCard
              key={item.id}
              title={item.title}
              source={item.source}
              published_at={item.published_at}
              url={item.url}
              summary={item.summary}
              importance_score={item.importance_score}
            />
          ))
        ) : (
          !loading && news.length === 0 && <div>暂无新闻</div>
        )}
        {/* 加载更多按钮: loading 时禁用 */}
        {!loading && hasMore && (
          <button 
            onClick={loadMore} 
            className="load-more-button"
            disabled={loading} // 加载时禁用按钮
            style={{ 
              display: 'block', 
              width: '100%', 
              padding: '0.8rem', 
              marginTop: '1.5rem',
              backgroundColor: 'var(--accent)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.95rem' }}
          >
            加载更多
          </button>
        )}
        {/* 移除底部的加载提示，因为现在加载是全局的 */}
      </div>
    </Layout>
  );
}; 


function App() {
  const [allNews, setAllNews] = useState([]); // 存储所有获取到的新闻
  const [news, setNews] = useState([]); // 存储当前显示的新闻
  const [displayCount, setDisplayCount] = useState(20); // 控制显示数量
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 
  const [category, setCategory] = useState('all');
  const [availableCategories, setAvailableCategories] = useState([]);
  const [hasMore, setHasMore] = useState(false); // 初始为 false，获取数据后判断
  
  // 移除 filters 中的 limit 和 skip
  const [filters, setFilters] = useState({
    minScore: 0,
    days: 7,
  });
  
  const ITEMS_PER_PAGE = 20; // 定义每次加载更多显示的数量

  // 使用 useCallback 包装 handleFilterChange
  const handleFilterChange = useCallback((newFilters) => {
    console.log("过滤器变化:", newFilters);
    setFilters({ // 只保留 minScore 和 days
      minScore: newFilters.minScore,
      days: newFilters.days,
    }); 
    // 重置状态以触发 useEffect 重新加载
    setAllNews([]); 
    setNews([]); 
    setDisplayCount(ITEMS_PER_PAGE); 
    setLoading(true); 
    setHasMore(false);
  }, []); // 空依赖，因为函数不依赖外部变量

  // 使用 useCallback 包装 handleCategoryChange
  const handleCategoryChange = useCallback((newCategory) => {
    setCategory(newCategory);
    // 重置状态以触发 useEffect 重新加载
    setAllNews([]); 
    setNews([]); 
    setDisplayCount(ITEMS_PER_PAGE); 
    setLoading(true); 
    setHasMore(false);
  }, []); // 空依赖

  // Effect for loading news (获取全部，然后排序)
  useEffect(() => {
    console.log("开始获取新闻(方案一)，分类:", category, "过滤器:", filters);
    let isMounted = true; 
    const loadAllNews = async () => {
      setLoading(true); // 开始加载
      setError(null);
      try {
        // 请求大量数据 (受后端限制，最多100)
        const fetchedNews = await fetchNews({ 
          category: category === 'all' ? null : category,
          minScore: filters.minScore,
          days: filters.days,
          limit: 100 // 请求后端允许的最大数量
          // 不再传递 skip
        });

        console.log(`获取到 ${fetchedNews.length} 条新闻`);
        
        if (isMounted) {
          let sortedNews = [...fetchedNews]; // 创建副本以进行排序

          // 全局排序 (如果需要)
          if (filters.minScore === 0) {
            console.log("按发布时间排序...");
            sortedNews.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
          } else {
            // 如果按评分排序，后端已经排序好了 (News.importance_score.desc())
            console.log("按重要性评分排序 (由后端完成)...");
          }

          setAllNews(sortedNews); // 存储完整排序列表

          // 设置初始显示的列表
          const initialDisplay = sortedNews.slice(0, ITEMS_PER_PAGE);
          setNews(initialDisplay);
          setDisplayCount(initialDisplay.length); // 更新实际显示的条数

          // 判断是否还有更多
          setHasMore(initialDisplay.length < sortedNews.length); 
          console.log(`初始显示 ${initialDisplay.length} 条，总共 ${sortedNews.length} 条，还有更多: ${initialDisplay.length < sortedNews.length}`);
        }

      } catch (err) {
        console.error("获取新闻失败:", err);
        if (isMounted) {
          setError("加载新闻失败，请稍后重试。"); 
          setAllNews([]); // 出错时清空
          setNews([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false); // 结束加载
        }
      }
    };

    loadAllNews();

    return () => {
      isMounted = false; 
    };
  // 依赖项改为 category 和 filters 的值
  }, [category, filters.minScore, filters.days]); 

  // Effect for loading categories (保持不变)
  useEffect(() => {
    let isMounted = true;
    const loadCategories = async () => {
      try {
        const fetchedCategories = await fetchCategories();
        if (isMounted) {
          setAvailableCategories(fetchedCategories.filter(cat => cat && cat.name));
        }
      } catch (err) {
        console.error("获取分类失败:", err);
      }
    };
    loadCategories();
    return () => { isMounted = false; };
  }, []); 

  // 加载更多函数 (纯前端逻辑)
  const loadMore = useCallback(() => {
    if (!loading && hasMore) { // 确保不在加载中且确实有更多
      console.log("加载更多...");
      setDisplayCount(prevCount => {
        const newCount = Math.min(prevCount + ITEMS_PER_PAGE, allNews.length);
        console.log(`更新显示数量: ${newCount}`);
        
        // 更新显示的 news 列表
        setNews(allNews.slice(0, newCount)); 
        
        // 更新 hasMore 状态
        setHasMore(newCount < allNews.length); 
        console.log(`还有更多: ${newCount < allNews.length}`);
        
        return newCount; // 返回新的 displayCount
      });
    }
  }, [loading, hasMore, allNews]); // 依赖加载状态、是否有更多、完整列表

  // --- Router 和 Routes 部分保持不变 ---
  return (
    <Router basename="/crazynews">
      <Routes>
        <Route path="/" element={
          <MainContent 
            news={news}
            loading={loading}
            error={error}
            category={category}
            availableCategories={availableCategories}
            hasMore={hasMore}
            filters={filters}
            handleFilterChange={handleFilterChange}
            handleCategoryChange={handleCategoryChange}
            loadMore={loadMore}
            displayCount={displayCount} // 传递用于调试
            allNewsCount={allNews.length} // 传递用于调试
          />
        } />
        <Route path="/debug-api" element={<ApiDebugTool />} />
        <Route path="/crawler" element={<UrlCrawler />} />
        <Route path="/submit-url" element={<UrlCrawler />} />
        <Route path="/admin" element={<AdminPanel />} /> 
      </Routes>
    </Router>
  );
}

export default App;

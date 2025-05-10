from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from datetime import datetime
import uvicorn
import logging

from app.api import news, categories, crawler
from app.services.crawler import discover_news_task
from app.db.database import create_tables

# 配置日志
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# 创建FastAPI实例
app = FastAPI(title="新闻聚合API", description="新闻聚合和爬虫服务API")

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应替换为实际前端域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(news.router, prefix="/api")
app.include_router(categories.router, prefix="/api")
app.include_router(crawler.router, prefix="/api") 

# 初始化调度器
scheduler = AsyncIOScheduler()

@app.on_event("startup")
async def startup_event():
    """应用启动时执行的操作"""
    # 创建数据库表
    create_tables()
    
    # 配置并启动调度器
    scheduler.add_job(discover_news_task, 'interval', minutes=90, id='discover_news')
    scheduler.start()
    logger.info("调度器已启动，自动发现任务已安排")

@app.on_event("shutdown")
async def shutdown_event():
    """应用关闭时执行的操作"""
    if scheduler.running:
        scheduler.shutdown()
        logger.info("调度器已关闭")

@app.get("/")
async def root():
    """根路由，API健康检查"""
    return {
        "message": "新闻聚合API已启动",
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
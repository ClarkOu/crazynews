from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.db.database import Base

# 新闻-分类关联表
news_category = Table(
    'news_category', 
    Base.metadata,
    Column('news_id', String, ForeignKey('news.id')),
    Column('category_id', String, ForeignKey('categories.id'))
)

class News(Base):
    """新闻模型"""
    __tablename__ = "news"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    summary = Column(Text, nullable=False)
    content = Column(Text, nullable=False)
    source = Column(String, nullable=False)
    url = Column(String, nullable=False, unique=True)
    published_at = Column(DateTime, nullable=False, default=datetime.now)
    crawled_at = Column(DateTime, nullable=False, default=datetime.now)
    importance_score = Column(Float, nullable=False, default=5.0)
    raw_html = Column(Text, nullable=True)
    
    # 关系
    categories = relationship("Category", secondary=news_category, back_populates="news")
    
    def __repr__(self):
        return f"<News(id={self.id}, title={self.title})>"
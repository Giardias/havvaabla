// ============================================
// GLOBALEX BLOG SİSTEMİ - FIREBASE'DEN BLOG ÇEKER
// ============================================

import { 
    db, collection, query, orderBy, onSnapshot,
    BLOG_COLLECTION 
} from "./firebase-config.js";

console.log("📚 Blog sistemi yükleniyor...");

const BlogSystem = {
    init() {
        console.log("📚 Blog sistemi başlatılıyor...");
        this.loadBlocks();
    },

    loadBlocks() {
        const blogContainer = document.getElementById("blog-articles");
        const featuredContainer = document.getElementById("featured-article-container");
        
        if (!blogContainer) {
            console.log("⚠️ Blog container bulunamadı, blog sayfası değil");
            return;
        }

        console.log("🔥 Firestore'dan bloglar yükleniyor...");
        const q = query(collection(db, BLOG_COLLECTION), orderBy("timestamp", "desc"));
        
        onSnapshot(q, (snapshot) => {
            const blocks = [];
            snapshot.forEach(doc => {
                blocks.push({ id: doc.id, ...doc.data() });
            });
            
            console.log(`📊 ${blocks.length} blog yazısı yüklendi`);
            this.renderBlocks(blocks, blogContainer, featuredContainer);
        }, (error) => {
            console.error("❌ Firestore hatası:", error);
            blogContainer.innerHTML = `<div style="text-align: center; padding: 60px; background: white; border-radius: 16px;">
                <h3>❌ Firebase bağlantı hatası</h3>
                <p>${error.message}</p>
                <p style="color: #C4A962;">firebase-config.js'deki bilgileri kontrol et!</p>
            </div>`;
        });
    },

    renderBlocks(blocks, container, featuredContainer) {
        if (blocks.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 80px 20px; background: white; border-radius: 16px;">
                    <div style="font-size: 64px; margin-bottom: 20px;">📝</div>
                    <h3 style="font-family: 'EB Garamond', serif; font-size: 1.75rem; margin-bottom: 15px;">Henüz blog yazısı yok</h3>
                    <p style="color: #2B2D42; margin-bottom: 25px;">İlk blog yazınızı admin panelden ekleyin!</p>
                    <a href="admin.html" style="display: inline-block; background: #C4A962; color: #0A0A0A; padding: 12px 30px; border-radius: 30px; text-decoration: none; font-weight: 600;">➕ Yeni Blog Ekle</a>
                </div>
            `;
            return;
        }

        const featuredBlocks = blocks.filter(b => b.featured === true);
        const normalBlocks = blocks.filter(b => !b.featured);
        
        let html = '';
        
        // Öne çıkan blog
        if (featuredBlocks.length > 0 && featuredContainer) {
            const featured = featuredBlocks[0];
            featuredContainer.innerHTML = this.renderFeaturedBlock(featured);
        }

        // Normal bloglar
        (normalBlocks.length > 0 ? normalBlocks : blocks).forEach(block => {
            html += this.renderNormalBlock(block);
        });

        container.innerHTML = html;
    },

    renderFeaturedBlock(block) {
        const imageStyle = block.imageUrl 
            ? `background-image: url('${block.imageUrl}'); background-size: cover; background-position: center;` 
            : `background: ${block.imageGradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};`;

        return `
            <div class="featured-article">
                <article class="blog-article" style="display: grid; grid-template-columns: 400px 1fr; gap: 0; background: white; border-radius: 16px; overflow: hidden; margin-bottom: 40px; border: 1px solid rgba(196,169,98,0.2);">
                    <div class="article-image" style="height: 300px;">
                        <div class="image-placeholder" style="${imageStyle} width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
                            ${!block.imageUrl ? `<span style="color: white; font-weight: 600;">${block.imagePlaceholder || '✨ FEATURED'}</span>` : ''}
                        </div>
                    </div>
                    <div class="article-content" style="padding: 40px;">
                        <div style="display: flex; gap: 15px; margin-bottom: 20px; flex-wrap: wrap; align-items: center;">
                            <span style="background: rgba(196,169,98,0.1); color: #C4A962; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">${block.category || 'Technologie'}</span>
                            <span style="font-size: 0.75rem; color: #2B2D42; opacity: 0.7;">${this.formatDate(block.date)}</span>
                            <span style="font-size: 0.75rem; color: #2B2D42; opacity: 0.7;">${block.readTime || 8} Min.</span>
                            <span style="background: #C4A962; color: #0A0A0A; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">✨ Featured</span>
                        </div>
                        <h2 style="font-family: 'EB Garamond', serif; font-size: 2rem; margin-bottom: 20px;">${block.title}</h2>
                        <p style="color: #2B2D42; line-height: 1.6; margin-bottom: 30px;">${block.excerpt || this.stripHtml(block.content).substring(0, 180)}...</p>
                        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 30px;">
                            <div style="width: 48px; height: 48px; background: #C4A962; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700;">${block.authorAvatar || 'DR'}</div>
                            <div>
                                <div style="font-weight: 600;">${block.author || 'Dr. Robert Schmidt'}</div>
                                <div style="font-size: 0.875rem; color: #666;">${block.authorTitle || 'Autor'}</div>
                            </div>
                        </div>
                        <a href="blog-post.html?slug=${block.slug || block.id}" style="color: #C4A962; text-decoration: none; font-weight: 600; display: inline-flex; align-items: center; gap: 5px;">Weiterlesen →</a>
                    </div>
                </article>
            </div>
        `;
    },

    renderNormalBlock(block) {
        const imageStyle = block.imageUrl 
            ? `background-image: url('${block.imageUrl}'); background-size: cover; background-position: center;` 
            : `background: ${block.imageGradient || 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'};`;

        return `
            <article class="blog-article" style="display: grid; grid-template-columns: 300px 1fr; gap: 0; background: white; border-radius: 16px; overflow: hidden; margin-bottom: 30px; border: 1px solid rgba(196,169,98,0.2);">
                <div class="article-image" style="height: 250px;">
                    <div class="image-placeholder" style="${imageStyle} width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
                        ${!block.imageUrl ? `<span style="color: white; font-weight: 600;">${block.imagePlaceholder || '📝 Blog'}</span>` : ''}
                    </div>
                </div>
                <div class="article-content" style="padding: 30px;">
                    <div style="display: flex; gap: 15px; margin-bottom: 15px; flex-wrap: wrap;">
                        <span style="background: rgba(196,169,98,0.1); color: #C4A962; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">${block.category || 'Technologie'}</span>
                        <span style="font-size: 0.75rem; color: #2B2D42; opacity: 0.7;">${this.formatDate(block.date)}</span>
                        <span style="font-size: 0.75rem; color: #2B2D42; opacity: 0.7;">${block.readTime || 6} Min.</span>
                    </div>
                    <h2 style="font-family: 'EB Garamond', serif; font-size: 1.5rem; margin-bottom: 15px;">${block.title}</h2>
                    <p style="color: #2B2D42; line-height: 1.6; margin-bottom: 20px;">${block.excerpt || this.stripHtml(block.content).substring(0, 150)}...</p>
                    <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                        <div style="width: 40px; height: 40px; background: #C4A962; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.875rem;">${block.authorAvatar || 'MS'}</div>
                        <div>
                            <div style="font-weight: 600; font-size: 0.875rem;">${block.author || 'Michael Schneider'}</div>
                            <div style="font-size: 0.75rem; color: #666;">${block.authorTitle || 'Autor'}</div>
                        </div>
                    </div>
                    <a href="blog-post.html?slug=${block.slug || block.id}" style="color: #C4A962; text-decoration: none; font-weight: 600; font-size: 0.875rem; display: inline-flex; align-items: center; gap: 5px;">Weiterlesen →</a>
                </div>
            </article>
        `;
    },

    formatDate(dateStr) {
        if (!dateStr) return '15. Jan 2024';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });
        } catch (e) {
            return dateStr;
        }
    },

    stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }
};

// Sayfa yüklendiğinde başlat
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('blog-articles')) {
        BlogSystem.init();
    }
});

export default BlogSystem;
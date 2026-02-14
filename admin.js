// ============================================
// GLOBALEX ADMIN PANEL - KESİN ÇÖZÜM
// ============================================

import { 
    db, storage, auth, 
    collection, addDoc, serverTimestamp,
    ref, uploadBytes, getDownloadURL,
    signInWithEmailAndPassword, signOut, onAuthStateChanged,
    BLOG_COLLECTION
} from "./firebase-config.js";

// --------------------------------------------
// ADMIN SİSTEMİ - BAŞLAT
// --------------------------------------------
console.log("📋 Admin sistemi yükleniyor...");

// Sayfa yüklendiğinde çalıştır
document.addEventListener('DOMContentLoaded', function() {
    console.log("📋 DOM yüklendi, admin sistemi başlatılıyor...");
    
    // Firebase Auth durumunu dinle
    onAuthStateChanged(auth, (user) => {
        console.log("👤 Auth durumu:", user ? `Giriş yaptı: ${user.email}` : "Çıkış yapıldı");
        
        const loginSection = document.getElementById('login-section');
        const adminPanel = document.getElementById('admin-panel');
        
        if (!loginSection || !adminPanel) {
            console.error("❌ HTML elementleri bulunamadı!");
            return;
        }
        
        if (user) {
            // GİRİŞ YAPILDI
            loginSection.style.display = 'none';
            adminPanel.style.display = 'block';
            
            // Kullanıcı bilgilerini göster
            const userEmailEl = document.getElementById('user-email');
            const userAvatarEl = document.getElementById('user-avatar');
            
            if (userEmailEl) userEmailEl.textContent = user.email || 'admin@globalex.digital';
            if (userAvatarEl) {
                const firstChar = user.email?.charAt(0).toUpperCase() || 'A';
                userAvatarEl.textContent = firstChar;
            }
            
            console.log("✅ Admin panel aktif");
        } else {
            // ÇIKIŞ YAPILDI
            loginSection.style.display = 'block';
            adminPanel.style.display = 'none';
            console.log("🔒 Admin panel kapalı");
        }
    });
    
    // ---------- LOGIN BUTONU ----------
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('login-email')?.value || 'admin@globalex.digital';
            const password = document.getElementById('login-password')?.value || '123456';
            
            console.log("🔐 Giriş deneniyor:", email);
            
            // Butonu disable et
            loginBtn.disabled = true;
            loginBtn.innerHTML = '<span>⏳</span> Giriş yapılıyor...';
            
            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    console.log("✅ Giriş başarılı:", userCredential.user.email);
                    // Başarılı mesajı
                    setTimeout(() => {
                        loginBtn.disabled = false;
                        loginBtn.innerHTML = '<span>🔓</span> Giriş Yap';
                    }, 500);
                })
                .catch((error) => {
                    console.error("❌ Giriş hatası:", error.code, error.message);
                    
                    // Butonu eski haline getir
                    loginBtn.disabled = false;
                    loginBtn.innerHTML = '<span>🔓</span> Giriş Yap';
                    
                    let errorMsg = "❌ Giriş hatası:\n";
                    if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
                        errorMsg += "E-posta veya şifre yanlış!";
                    } else if (error.code === 'auth/user-not-found') {
                        errorMsg += "Kullanıcı bulunamadı!\nFirebase Authentication'da kullanıcı oluştur: admin@globalex.digital / 123456";
                    } else if (error.code === 'auth/too-many-requests') {
                        errorMsg += "Çok fazla başarısız giriş. Sonra dene.";
                    } else {
                        errorMsg += error.message;
                    }
                    
                    alert(errorMsg);
                });
        });
    } else {
        console.error("❌ Login butonu bulunamadı!");
    }
    
    // ---------- ÇIKIŞ BUTONU ----------
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            signOut(auth).then(() => {
                console.log("✅ Çıkış yapıldı");
            });
        });
    }
    
    // ---------- BLOG YÜKLEME FORMU ----------
    const form = document.getElementById('block-form');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submit-btn');
            if (!submitBtn) return;
            
            // ---------- FORM VALİDASYONU ----------
            const title = document.getElementById('block-title')?.value;
            const content = document.getElementById('block-content')?.value;
            const author = document.getElementById('block-author')?.value;
            const category = document.getElementById('block-category')?.value;
            
            if (!title || !content || !author || !category) {
                alert("❌ Lütfen tüm zorunlu alanları doldurun:\n- Başlık\n- İçerik\n- Yazar\n- Kategori");
                return;
            }
            
            // Yükleme başladı
            submitBtn.disabled = true;
            submitBtn.innerHTML = '📤 Yükleniyor...';
            
            try {
                // ---------- SLUG OLUŞTUR ----------
                let slug = document.getElementById('block-slug')?.value;
                if (!slug) {
                    slug = title.toLowerCase()
                        .replace(/[^a-z0-9]/g, '-')
                        .replace(/-+/g, '-')
                        .replace(/^-|-$/g, '');
                }
                
                // ---------- TARİH ----------
                const today = new Date().toISOString().split('T')[0];
                
                // ---------- BLOG VERİSİ HAZIRLA ----------
                const blockData = {
                    title: title,
                    slug: slug,
                    content: content,
                    excerpt: document.getElementById('block-excerpt')?.value || content.substring(0, 160).replace(/<[^>]*>/g, '') + '...',
                    category: category,
                    categoryKey: document.getElementById('block-category-key')?.value || 'category' + category.replace(/\s+/g, ''),
                    author: author,
                    authorKey: document.getElementById('block-author-key')?.value || 'author' + Date.now(),
                    authorTitle: document.getElementById('block-author-title')?.value || 'Autor',
                    authorTitleKey: document.getElementById('block-author-title-key')?.value || 'authorTitle',
                    authorAvatar: document.getElementById('block-author-avatar')?.value || author.charAt(0).toUpperCase(),
                    readTime: parseInt(document.getElementById('block-readtime')?.value) || 5,
                    featured: document.getElementById('block-featured')?.checked || false,
                    imagePlaceholder: document.getElementById('block-image-text')?.value || '📝 Blog',
                    imageGradient: document.getElementById('block-gradient')?.value || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    date: today,
                    timestamp: serverTimestamp(),
                    status: 'published',
                    views: 0
                };
                
                // ---------- GÖRSEL YÜKLE (VARSA) ----------
                const imageFile = document.getElementById('block-image')?.files[0];
                if (imageFile) {
                    try {
                        console.log("🖼️ Görsel yükleniyor...");
                        const fileName = `${slug}-${Date.now()}.${imageFile.name.split('.').pop()}`;
                        const storageRef = ref(storage, `blog-images/${fileName}`);
                        const snapshot = await uploadBytes(storageRef, imageFile);
                        const downloadURL = await getDownloadURL(snapshot.ref);
                        blockData.imageUrl = downloadURL;
                        console.log("✅ Görsel yüklendi:", downloadURL);
                    } catch (imageError) {
                        console.error("⚠️ Görsel yüklenemedi:", imageError);
                        alert("Görsel yüklenemedi ama blog kaydedilecek.");
                    }
                }
                
                // ---------- FIRESTORE'A KAYDET ----------
                console.log("📤 Firestore'a kaydediliyor:", blockData.title);
                const docRef = await addDoc(collection(db, BLOG_COLLECTION), blockData);
                console.log("✅ Blog kaydedildi! ID:", docRef.id);
                
                alert(`✅ Blog başarıyla yüklendi!\n\nTitel: ${blockData.title}\nKategorie: ${blockData.category}\nSlug: ${blockData.slug}`);
                
                // ---------- FORMU TEMİZLE ----------
                form.reset();
                document.getElementById('block-featured').checked = false;
                
                const previewDiv = document.getElementById('image-preview');
                if (previewDiv) previewDiv.innerHTML = '';
                
                // ---------- BLOG SAYFASINI AÇ ----------
                if (confirm('Blog sayfasını açmak ister misiniz?')) {
                    window.open('blog.html', '_blank');
                }
                
            } catch (error) {
                console.error("❌ HATA:", error);
                alert(`❌ Hata oluştu: ${error.message}\n\nFirebase bağlantını kontrol et!`);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '📤 Bloğu Yayınla →';
            }
        });
    } else {
        console.error("❌ Blog formu bulunamadı!");
    }
    
    // ---------- ÖNİZLEME BUTONU ----------
    const previewBtn = document.getElementById('preview-btn');
    if (previewBtn) {
        previewBtn.addEventListener('click', function() {
            const title = document.getElementById('block-title')?.value;
            const content = document.getElementById('block-content')?.value;
            
            if (!title || !content) {
                alert('Başlık ve içerik zorunlu!');
                return;
            }
            
            const author = document.getElementById('block-author')?.value || 'GLOBALEX';
            const authorAvatar = document.getElementById('block-author-avatar')?.value || author.charAt(0).toUpperCase();
            const date = new Date().toLocaleDateString('de-DE');
            const category = document.getElementById('block-category')?.value || 'Technologie';
            const readTime = document.getElementById('block-readtime')?.value || '5';
            
            const previewWindow = window.open('', '_blank');
            previewWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Önizleme: ${title}</title>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=EB+Garamond:wght@400;500&display=swap" rel="stylesheet">
                    <style>
                        body { font-family: 'Inter', sans-serif; background: #F8F5F0; padding: 40px; margin: 0; color: #0A0A0A; }
                        .container { max-width: 800px; margin: 0 auto; }
                        .article { background: white; border-radius: 16px; padding: 40px; box-shadow: 0 12px 40px rgba(0,0,0,0.04); }
                        h1 { font-family: 'EB Garamond', serif; font-size: 2.5rem; margin-bottom: 20px; }
                        .meta { display: flex; gap: 20px; margin-bottom: 30px; color: #C4A962; font-size: 0.875rem; }
                        .author { display: flex; align-items: center; gap: 15px; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid rgba(196,169,98,0.2); }
                        .avatar { width: 48px; height: 48px; background: #C4A962; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #0A0A0A; }
                        .content { line-height: 1.8; }
                        .content h2 { font-family: 'EB Garamond', serif; margin: 40px 0 20px; }
                        .content p { margin-bottom: 20px; color: #2B2D42; }
                        .content ul, .content ol { margin-left: 20px; margin-bottom: 20px; }
                        .badge { background: #C4A962; color: #0A0A0A; padding: 4px 16px; border-radius: 30px; font-size: 0.75rem; font-weight: 600; display: inline-block; margin-bottom: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="article">
                            <span class="badge">🔍 ÖNİZLEME</span>
                            <div class="meta">
                                <span>${category}</span>
                                <span>${date}</span>
                                <span>${readTime} Min.</span>
                            </div>
                            <h1>${title}</h1>
                            <div class="author">
                                <div class="avatar">${authorAvatar}</div>
                                <div>
                                    <div style="font-weight: 600;">${author}</div>
                                    <div style="font-size: 0.875rem; color: #666;">${document.getElementById('block-author-title')?.value || 'Autor'}</div>
                                </div>
                            </div>
                            <div class="content">
                                ${content}
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `);
        });
    }
    
    // ---------- GÖRSEL ÖNİZLEME ----------
    const imageInput = document.getElementById('block-image');
    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            if (!file.type.startsWith('image/')) {
                alert('Lütfen geçerli bir görsel dosyası seçin.');
                return;
            }
            
            if (file.size > 5 * 1024 * 1024) {
                alert('Görsel boyutu 5MB\'dan küçük olmalıdır.');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(event) {
                const preview = document.getElementById('image-preview');
                if (preview) {
                    preview.innerHTML = `<img src="${event.target.result}" style="max-width: 200px; max-height: 200px; border-radius: 12px; border: 3px solid #C4A962;">`;
                }
            };
            reader.readAsDataURL(file);
        });
    }
});

// AdminSystem objesini export et
const AdminSystem = { init: () => {} };
export default AdminSystem;
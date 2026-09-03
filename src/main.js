// 粒子效果系统
class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('particles-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouse = {
            x: null,
            y: null,
            radius: 150
        };
        
        this.init();
        this.animate();
        this.bindEvents();
    }
    
    init() {
        this.resizeCanvas();
        this.createParticles();
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createParticles() {
        const numberOfParticles = Math.floor((this.canvas.width * this.canvas.height) / 12000);
        
        for (let i = 0; i < numberOfParticles; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.8,
                vy: (Math.random() - 0.5) * 0.8,
                size: Math.random() * 4 + 1,
                opacity: Math.random() * 0.6 + 0.2,
                originalSize: Math.random() * 4 + 1,
                pulseSpeed: Math.random() * 0.02 + 0.01,
                angle: Math.random() * Math.PI * 2,
                color: this.getRandomColor()
            });
        }
    }
    
    getRandomColor() {
        const colors = [
            'rgba(100, 181, 246, ',  // 蓝色
            'rgba(186, 104, 200, ',  // 紫色
            'rgba(255, 255, 255, ',  // 白色
            'rgba(129, 199, 132, ',  // 绿色
            'rgba(255, 183, 77, '    // 橙色
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 更新和绘制粒子
        this.particles.forEach((particle, index) => {
            // 更新位置
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // 更新角度用于脉动效果
            particle.angle += particle.pulseSpeed;
            
            // 脉动大小效果
            particle.size = particle.originalSize + Math.sin(particle.angle) * 0.5;
            
            // 边界检测 - 循环边界
            if (particle.x < -10) particle.x = this.canvas.width + 10;
            if (particle.x > this.canvas.width + 10) particle.x = -10;
            if (particle.y < -10) particle.y = this.canvas.height + 10;
            if (particle.y > this.canvas.height + 10) particle.y = -10;
            
            // 鼠标交互 - 吸引效果
            if (this.mouse.x && this.mouse.y) {
                const dx = this.mouse.x - particle.x;
                const dy = this.mouse.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.mouse.radius) {
                    const force = (this.mouse.radius - distance) / this.mouse.radius;
                    const attraction = 0.02;
                    particle.vx += dx * force * attraction;
                    particle.vy += dy * force * attraction;
                    
                    // 限制速度
                    const maxSpeed = 2;
                    const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
                    if (speed > maxSpeed) {
                        particle.vx = (particle.vx / speed) * maxSpeed;
                        particle.vy = (particle.vy / speed) * maxSpeed;
                    }
                }
            }
            
            // 绘制粒子光晕效果
            const gradient = this.ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, particle.size * 2
            );
            gradient.addColorStop(0, particle.color + particle.opacity + ')');
            gradient.addColorStop(0.5, particle.color + (particle.opacity * 0.3) + ')');
            gradient.addColorStop(1, particle.color + '0)');
            
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
            
            // 绘制粒子核心
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color + (particle.opacity + 0.3) + ')';
            this.ctx.fill();
            
            // 连接附近的粒子 - 增强连线效果
            this.particles.slice(index + 1).forEach(otherParticle => {
                const dx = particle.x - otherParticle.x;
                const dy = particle.y - otherParticle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 120) {
                    const opacity = 0.15 * (1 - distance / 120);
                    this.ctx.beginPath();
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(otherParticle.x, otherParticle.y);
                    this.ctx.strokeStyle = `rgba(100, 181, 246, ${opacity})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.stroke();
                }
            });
        });
        
        requestAnimationFrame(() => this.animate());
    }
    
    bindEvents() {
        // 窗口大小调整
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.particles = [];
            this.createParticles();
        });
        
        // 鼠标移动
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        
        // 鼠标离开
        window.addEventListener('mouseleave', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
    }
}

// 导航栏功能
class Navigation {
    constructor() {
        this.navbar = document.querySelector('.navbar');
        this.hamburger = document.querySelector('.hamburger');
        this.navMenu = document.querySelector('.nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.dropdownItems = document.querySelectorAll('.nav-item.dropdown');
        
        // 用于管理hover延迟的变量
        this.hoverTimeouts = new Map();

        this.bindEvents();
    }

    bindEvents() {
        // 汉堡菜单点击
        this.hamburger.addEventListener('click', () => {
            this.hamburger.classList.toggle('active');
            this.navMenu.classList.toggle('active');
        });

        // 导航链接点击
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const targetId = link.getAttribute('href');

                // 移动端下拉父级链接：完全交由下方 dropdownItems 专属逻辑处理
                // 不在这里关闭菜单，否则会导致菜单先消失再展开子选项
                if (window.innerWidth <= 768 && link.closest('.nav-item.dropdown')) {
                    return;
                }

                // 如果链接指向的是一个外部HTML文件（例如 news.html）
                if (targetId.endsWith('.html') || targetId.includes('.html#')) {
                    // 移动端关闭菜单
                    this.hamburger.classList.remove('active');
                    this.navMenu.classList.remove('active');
                    // 允许默认的页面跳转行为
                    return; 
                }

                // 对于锚点链接，阻止默认行为并进行平滑滚动
                e.preventDefault();
                const targetSection = document.querySelector(targetId);

                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth'
                    });
                }

                // 移动端关闭菜单
                // For main nav links, close the menu.
                if (!link.closest('.dropdown-content')) {
                    this.hamburger.classList.remove('active');
                    this.navMenu.classList.remove('active');
                }
            });
        });

        // 下拉菜单点击 (仅在移动端) - 切换子菜单显示
        this.dropdownItems.forEach(dropdownItem => {
            const link = dropdownItem.querySelector('.nav-link');
            
            // 为下拉菜单链接添加特殊的点击处理
            link.addEventListener('click', (e) => {
                // 只有当宽度小于等于768px时才触发下拉菜单逻辑
                if (window.innerWidth <= 768) {
                    const targetId = link.getAttribute('href');
                    
                    // 如果是外部链接，先展开子菜单，延迟跳转
                    if (targetId.endsWith('.html') || targetId.includes('.html#')) {
                        // 如果子菜单未展开，先展开子菜单
                        if (!dropdownItem.classList.contains('active')) {
                            e.preventDefault(); // 阻止立即跳转
                            dropdownItem.classList.add('active');
                            return;
                        }
                        // 如果子菜单已展开，允许正常跳转
                        // 关闭菜单
                        this.hamburger.classList.remove('active');
                        this.navMenu.classList.remove('active');
                        dropdownItem.classList.remove('active');
                    }
                }
            });

            // 对下拉菜单中的子链接进行事件监听，确保点击后关闭汉堡菜单
            const dropdownLinks = dropdownItem.querySelectorAll('.dropdown-content a');
            dropdownLinks.forEach(subLink => {
                subLink.addEventListener('click', () => {
                    // Close hamburger menu on dropdown item click
                    this.hamburger.classList.remove('active');
                    this.navMenu.classList.remove('active');
                    dropdownItem.classList.remove('active');
                });
            });
        });

        // 滚动时改变导航栏样式
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            
            if (scrollY > 100) {
                // 滚动时降低不透明度
                this.navbar.style.background = 'rgba(0, 0, 0, 0.3)';
                this.navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3)';
            } else {
                // 页面顶部时保持较高的不透明度
                this.navbar.style.background = 'rgba(0, 0, 0, 0.8)';
                this.navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.5)';
            }
        });

        // 窗口大小变化时关闭移动菜单
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                this.hamburger.classList.remove('active');
                this.navMenu.classList.remove('active');
                this.dropdownItems.forEach(item => item.classList.remove('active')); // 关闭所有下拉菜单
            }
        });

        // 桌面端下拉菜单hover优化
        this.setupDesktopHoverOptimization();
    }

    setupDesktopHoverOptimization() {
        this.dropdownItems.forEach((dropdownItem, index) => {
            const dropdownContent = dropdownItem.querySelector('.dropdown-content');
            
            // 鼠标进入下拉菜单项
            dropdownItem.addEventListener('mouseenter', () => {
                // 只在桌面端生效
                if (window.innerWidth > 768) {
                    // 清除所有其他下拉菜单的隐藏定时器
                    this.hoverTimeouts.forEach((timeout, key) => {
                        clearTimeout(timeout);
                        this.hoverTimeouts.delete(key);
                    });
                    
                    // 立即隐藏所有其他下拉菜单
                    this.dropdownItems.forEach((item, itemIndex) => {
                        if (itemIndex !== index) {
                            item.classList.remove('hover-active');
                        }
                    });
                    
                    // 立即显示当前下拉菜单
                    dropdownItem.classList.add('hover-active');
                }
            });

            // 鼠标离开下拉菜单项
            dropdownItem.addEventListener('mouseleave', () => {
                // 只在桌面端生效
                if (window.innerWidth > 768) {
                    // 设置延迟隐藏，给用户时间移动到子菜单
                    const timeout = setTimeout(() => {
                        dropdownItem.classList.remove('hover-active');
                        this.hoverTimeouts.delete(index);
                    }, 300); // 300ms的延迟
                    
                    this.hoverTimeouts.set(index, timeout);
                }
            });
        });
    }
}

// 滚动动画
class ScrollAnimations {
    constructor() {
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        this.init();
    }
    
    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    
                    // 如果是hero-image，同时触发内部图片的动画
                    if (entry.target.classList.contains('hero-image')) {
                        const coverImage = entry.target.querySelector('.cover-image');
                        if (coverImage) {
                            coverImage.classList.add('show');
                        }
                    }
                }
            });
        }, this.observerOptions);
        
        // 观察所有需要动画的元素
        const animatedElements = document.querySelectorAll(
            '.hero-image, .hero-text, .ed-container, .wave-container, .master-message-slider, .news-card, .journal-card, .activity-card, .category-card, .tool-card'
        );
        
        animatedElements.forEach(el => {
            // 确保元素的初始状态
            el.style.opacity = '0';
            
            // 为不同元素设置不同的初始transform
            if (el.classList.contains('hero-image')) {
                // 图片盒子原地淡入
                el.style.transform = 'translateY(0)';
                el.style.transition = 'opacity 1.5s ease, transform 1.5s ease';
            } else if (el.classList.contains('hero-text')) {
                // div盒子原地淡入
                el.style.transform = 'translateY(0)';
                el.style.transition = 'opacity 2.0s ease, transform 2.0s ease';
            } else {
                // 其他元素保持原有效果
                el.style.transform = 'translateY(30px)';
                el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            }
            
            observer.observe(el);
        });
    }
}

// 按钮交互效果
class ButtonEffects {
    constructor() {
        this.init();
    }
    
    init() {
        const buttons = document.querySelectorAll('.btn');
        
        buttons.forEach(button => {
            button.addEventListener('mouseenter', (e) => {
                const ripple = document.createElement('span');
                ripple.classList.add('ripple');
                button.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });
        
        // 添加涟漪效果的CSS
        const style = document.createElement('style');
        style.textContent = `
            .btn {
                position: relative;
                overflow: hidden;
            }
            
            .ripple {
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                transform: scale(0);
                animation: ripple-animation 0.6s linear;
                pointer-events: none;
            }
            
            @keyframes ripple-animation {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// 平滑滚动到顶部
class ScrollToTop {
    constructor() {
        this.createButton();
        this.bindEvents();
    }
    
    createButton() {
        this.button = document.createElement('div');
        this.button.innerHTML = '↑';
        this.button.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #64b5f6 0%, #42a5f5 100%);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            font-weight: bold;
            cursor: pointer;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            z-index: 1000;
            box-shadow: 0 4px 15px rgba(100, 181, 246, 0.4);
        `;
        
        document.body.appendChild(this.button);
    }
    
    bindEvents() {
        // 滚动显示/隐藏按钮
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                this.button.style.opacity = '1';
                this.button.style.visibility = 'visible';
            } else {
                this.button.style.opacity = '0';
                this.button.style.visibility = 'hidden';
            }
        });
        
        // 点击滚动到顶部
        this.button.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        // 悬停效果
        this.button.addEventListener('mouseenter', () => {
            this.button.style.transform = 'translateY(-3px)';
            this.button.style.boxShadow = '0 6px 20px rgba(100, 181, 246, 0.6)';
        });
        
        this.button.addEventListener('mouseleave', () => {
            this.button.style.transform = 'translateY(0)';
            this.button.style.boxShadow = '0 4px 15px rgba(100, 181, 246, 0.4)';
        });
    }
}

// 首页图片管理系统（简化版 - 只使用原图）
class HeroImageManager {
    constructor() {
        this.heroImage = document.getElementById('hero-image');
        this.firstCoverImage = 'src/assets/first_cover.webp';

        // 现在直接获取 img 元素
        this.calligraphyImage = document.getElementById('pivot-logo');

        if (this.heroImage) {
            this.initImage();
        }

        if (this.calligraphyImage) {
            this.initCalligraphy(); // 调用初始化图像动画
        }
    }

    initImage() {
        // 始终使用first_cover.webp
        this.heroImage.src = this.firstCoverImage;
        console.log('使用默认封面图片:', this.firstCoverImage);

        // 清理可能存在的localStorage标记
        localStorage.removeItem('pivot_society_visited');
    }

    // 初始化“支点”书写动画 (现在改为图像动画)
    initCalligraphy() {
        if (this.calligraphyImage) {
            this.calligraphyImage.style.opacity = '0'; // 初始隐藏图像
            this.calligraphyImage.style.transform = 'translateX(100px)'; // 初始向右偏移100px，从右往左淡入，调大幅度
            this.calligraphyImage.style.transition = 'opacity 1.5s ease-out, transform 1.5s ease-out'; // 设置过渡效果
            
            // 添加一个小的延迟后执行动画
            setTimeout(() => {
                this.calligraphyImage.style.opacity = '1';
                this.calligraphyImage.style.transform = 'translateX(0)';
                // 在淡入动画完成后，添加浮动动画类
                setTimeout(() => {
                    this.calligraphyImage.classList.add('hero-float-active');
                }, 1500); // 1.5s 是淡入动画的持续时间
            }, 500); // 延迟0.5秒开始动画
        }
    }
}

// 大师寄语卡片滑动器
class MasterMessageSlider {
    constructor() {
        this.cards = document.querySelectorAll('.master-message-slider .master-card');
        this.active = Math.floor(this.cards.length / 2); // 从中间开始
        this.nextBtn = document.getElementById('master-next');
        this.prevBtn = document.getElementById('master-prev');
        
        if (this.cards.length > 0) {
            this.init();
        }
    }
    
    init() {
        this.loadShow();
        this.bindEvents();
    }
    
    loadShow() {
        if (!this.cards[this.active]) return;
        
        // 重置所有卡片
        this.cards.forEach(card => {
            card.style.transform = 'none';
            card.style.zIndex = '0';
            card.style.filter = 'none';
            card.style.opacity = '0';
        });
        
        // 显示当前激活的卡片
        this.cards[this.active].style.transform = 'none';
        this.cards[this.active].style.zIndex = '1';
        this.cards[this.active].style.filter = 'none';
        this.cards[this.active].style.opacity = '1';
        
        // 响应式偏移量：移动端按屏幕宽度缩小，最大 120px
        const offset = Math.min(120, window.innerWidth * 0.3);

        // 显示右侧卡片
        let stt = 0;
        for (let i = this.active + 1; i < this.cards.length; i++) {
            stt++;
            this.cards[i].style.transform = `translateX(${offset * stt}px) scale(${1 - 0.2 * stt}) perspective(16px) rotateY(-1deg)`;
            this.cards[i].style.zIndex = -stt;
            this.cards[i].style.filter = 'blur(5px)';
            this.cards[i].style.opacity = stt > 2 ? 0 : 0.6;
        }
        
        // 显示左侧卡片
        stt = 0;
        for (let i = this.active - 1; i >= 0; i--) {
            stt++;
            this.cards[i].style.transform = `translateX(${-offset * stt}px) scale(${1 - 0.2 * stt}) perspective(16px) rotateY(1deg)`;
            this.cards[i].style.zIndex = -stt;
            this.cards[i].style.filter = 'blur(5px)';
            this.cards[i].style.opacity = stt > 2 ? 0 : 0.6;
        }
    }
    
    bindEvents() {
        if (this.nextBtn) {
            this.nextBtn.onclick = () => {
                // 循环到下一张，到末尾时回到第一张
                this.active = (this.active + 1) % this.cards.length;
                this.loadShow();
            };
        }
        
        if (this.prevBtn) {
            this.prevBtn.onclick = () => {
                // 循环到上一张，到开头时回到最后一张
                this.active = (this.active - 1 + this.cards.length) % this.cards.length;
                this.loadShow();
            };
        }
        
        // 添加键盘支持
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                // 循环到上一张，到开头时回到最后一张
                this.active = (this.active - 1 + this.cards.length) % this.cards.length;
                this.loadShow();
            } else if (e.key === 'ArrowRight') {
                // 循环到下一张，到末尾时回到第一张
                this.active = (this.active + 1) % this.cards.length;
                this.loadShow();
            }
        });
    }
}

// 页面加载完成后初始化所有功能
document.addEventListener('DOMContentLoaded', () => {
    // 初始化粒子系统
    new ParticleSystem();
    
    // 初始化导航功能
    new Navigation();
    
    // 初始化滚动动画
    new ScrollAnimations();
    
    // 初始化按钮效果
    new ButtonEffects();
    
    // 初始化返回顶部按钮
    new ScrollToTop();
    
    // 初始化首页图片管理（只在首页执行）
    if (document.body.classList.contains('homepage')) {
        new HeroImageManager();
        // 初始化大师寄语滑动器
        new MasterMessageSlider();
    }
    console.log('支点学社网站已加载完成！');
});

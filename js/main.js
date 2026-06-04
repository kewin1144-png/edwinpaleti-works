document.addEventListener('DOMContentLoaded', () => {
    const worksGrid = document.getElementById('works-grid');
    const brandDetail = document.getElementById('brand-detail');
    const masonryGallery = document.getElementById('masonry-gallery');
    const backBtn = document.getElementById('back-btn');
    const brandTitle = document.getElementById('brand-title');
    const heroSection = document.querySelector('.hero-section');
    const portfolioGridHeader = document.querySelector('.portfolio-grid-header');
    const filterPills = document.querySelectorAll('.pill[data-filter]');

    const filteredGallery = document.getElementById('filtered-gallery');

    // Helper to categorize individual files
    function getFileCategory(filename) {
        let low = filename.toLowerCase();
        // Prioritize explicit matches requested by user
        if(low.includes('logo')) return 'logo';
        if(low.includes('pack')) return 'packaging';
        if(low.includes('sm') || low.includes('social') || low.includes('post')) return 'social';
        if(low.includes('poster') || low.includes('brocher') || low.includes('brochure')) return 'brochures';
        if(low.includes('mp4') || low.endsWith('mov') || low.includes('video') || low.includes('anim')) return 'video';
        return 'other';
    }

    // portfolioData is now loaded globally from js/data.js
    if (typeof portfolioData !== 'undefined') {
        renderWorksGrid(portfolioData);
        setupFilters(portfolioData);
    } else {
        worksGrid.innerHTML = '<p style="color:red;">Error loading portfolio data. Make sure data.js is generated.</p>';
    }

    function setupFilters(data) {
        const allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'mp4', 'webm', 'mov'];

        filterPills.forEach(pill => {
            pill.addEventListener('click', () => {
                filterPills.forEach(p => p.classList.remove('active', 'outline-pill'));
                filterPills.forEach(p => p.classList.add('outline-pill'));
                pill.classList.remove('outline-pill');
                pill.classList.add('active');

                const filter = pill.getAttribute('data-filter');
                
                if (filter === 'all') {
                    // Show Brand Grid
                    filteredGallery.style.display = 'none';
                    worksGrid.style.display = 'grid';
                    filteredGallery.innerHTML = ''; // Clear memory
                } else {
                    // Show Image-Level Gallery
                    worksGrid.style.display = 'none';
                    filteredGallery.style.display = 'block';
                    filteredGallery.innerHTML = '';
                    
                    let delayIdx = 0;

                    // Search entire portfolio for matching images
                    Object.keys(data).forEach(brandName => {
                        let rawFiles = data[brandName];
                        if (!Array.isArray(rawFiles)) rawFiles = [rawFiles];

                        const files = rawFiles.filter(f => allowedExts.includes(f.split('.').pop().toLowerCase()));
                        
                        files.forEach(file => {
                            if (getFileCategory(file) === filter) {
                                const ext = file.split('.').pop().toLowerCase();
                                const isVideo = ['mp4', 'webm', 'mov'].includes(ext);

                                const item = document.createElement('div');
                                item.className = 'masonry-item';
                                
                                if (isVideo) {
                                    const video = document.createElement('video');
                                    video.src = getSafeUrl(file);
                                    video.muted = true;
                                    video.loop = true;
                                    video.autoplay = true;
                                    video.playsInline = true;
                                    video.controls = true; 
                                    item.appendChild(video);
                                } else {
                                    const img = document.createElement('img');
                                    img.src = getSafeUrl(file);
                                    img.loading = 'lazy';
                                    item.appendChild(img);
                                }
                                
                                item.style.animationDelay = `${delayIdx * 0.05}s`;
                                filteredGallery.appendChild(item);
                                delayIdx++;
                            }
                        });
                    });
                }
            });
        });
    }

    function getSafeUrl(path) {
        // encodeURI keeps @ and other safe characters intact, which fixes file:// loading issues
        // We only manually encode the troublemakers that break URLs (#, ?, +, &)
        return encodeURI(path)
            .replace(/#/g, '%23')
            .replace(/\?/g, '%3F')
            .replace(/\+/g, '%2B')
            .replace(/&/g, '%26');
    }

    function renderWorksGrid(data) {
        worksGrid.innerHTML = '';
        
        let index = 1;
        const allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'mp4', 'webm', 'mov'];

        // Explicit priority sequence requested by the user
        const prioritySequence = [
            "hsF",
            "ruhedent",
            "aayansh farms",
            "silver crest",
            "dhanensure",
            "1 good drink",
            "sherrys basket",
            "cedar dew",
            "dada golo soda"
        ];

        const sortedBrands = Object.keys(data).sort((a, b) => {
            const indexA = prioritySequence.indexOf(a);
            const indexB = prioritySequence.indexOf(b);
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return a.localeCompare(b); // Alphabetical fallback for remaining brands
        });

        sortedBrands.forEach(brandName => {
            let rawFiles = data[brandName];
            if (!Array.isArray(rawFiles)) rawFiles = [rawFiles];

            // Only keep valid images and videos (ignore pdfs, ai files, etc)
            const files = rawFiles.filter(f => allowedExts.includes(f.split('.').pop().toLowerCase()));
            if(files.length === 0) return;

            // 1. Find Main Cover Image
            let coverFile = files.find(f => f.toLowerCase().includes('main')) || files[0];
            const ext = coverFile.split('.').pop().toLowerCase();
            const isVideo = ['mp4', 'webm', 'mov'].includes(ext);

            // 2. Parse Categories from filenames
            let categories = new Set(['all']);
            files.forEach(f => {
                let low = f.toLowerCase();
                if(low.includes('logo')) categories.add('logo');
                if(low.includes('pack')) categories.add('packaging');
                if(low.includes('sm') || low.includes('social') || low.includes('post')) categories.add('social');
                if(low.includes('poster') || low.includes('brocher') || low.includes('brochure')) categories.add('brochures');
                if(low.includes('mp4') || low.endsWith('mov') || low.includes('video') || low.includes('anim')) categories.add('video');
            });

            const card = document.createElement('div');
            card.className = 'work-card';
            card.setAttribute('data-categories', Array.from(categories).join(' '));
            
            const label = document.createElement('div');
            label.className = 'card-label';
            const indexStr = String(index).padStart(2, '0');
            label.textContent = `${indexStr} // ${brandName}`;
            card.appendChild(label);

            if (isVideo) {
                const video = document.createElement('video');
                video.src = getSafeUrl(coverFile);
                video.muted = true;
                video.loop = true;
                video.autoplay = true;
                video.playsInline = true;
                card.appendChild(video);
            } else {
                const img = document.createElement('img');
                img.src = getSafeUrl(coverFile);
                img.loading = 'lazy';
                card.appendChild(img);
            }

            card.addEventListener('click', () => {
                openBrandDetail(brandName, files);
                // Push history state to allow native back button
                history.pushState({ brand: brandName }, '', `#${encodeURIComponent(brandName)}`);
            });

            card.style.animationDelay = `${(index - 1) * 0.05}s`;
            worksGrid.appendChild(card);
            index++;
        });
    }

    function openBrandDetail(brandName, files) {
        worksGrid.style.display = 'none';
        heroSection.style.display = 'none';
        if (portfolioGridHeader) portfolioGridHeader.style.display = 'none';
        brandDetail.style.display = 'block';
        brandTitle.textContent = brandName;
        
        masonryGallery.innerHTML = '';
        
        files.forEach((file, idx) => {
            const ext = file.split('.').pop().toLowerCase();
            const isVideo = ['mp4', 'webm', 'mov'].includes(ext);

            const item = document.createElement('div');
            item.className = 'masonry-item';
            
            if (isVideo) {
                const video = document.createElement('video');
                video.src = getSafeUrl(file);
                video.muted = true;
                video.loop = true;
                video.autoplay = true;
                video.playsInline = true;
                video.controls = true; 
                item.appendChild(video);
            } else {
                const img = document.createElement('img');
                img.src = getSafeUrl(file);
                img.loading = 'lazy';
                item.appendChild(img);
            }
            
            item.style.animationDelay = `${idx * 0.05}s`;
            masonryGallery.appendChild(item);
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function closeBrandDetail() {
        brandDetail.style.display = 'none';
        worksGrid.style.display = 'grid';
        heroSection.style.display = 'grid';
        if (portfolioGridHeader) portfolioGridHeader.style.display = 'block';
        masonryGallery.innerHTML = '';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Handle Native Browser Back Button
    window.addEventListener('popstate', (e) => {
        if (e.state && e.state.brand) {
            // Technically handled by initial load if we support deep linking, 
            // but for now, going back usually clears the state to null.
        } else {
            closeBrandDetail();
        }
    });

    // Handle On-Screen Back Button
    backBtn.addEventListener('click', () => {
        // Triggers the popstate event naturally
        if (history.state && history.state.brand) {
            history.back();
        } else {
            closeBrandDetail();
        }
    });
});

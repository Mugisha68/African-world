/* ========================================================
   AFRICA & THE WORLD - JAVASCRIPT ENGINE
   Typewriter, Hero Carousel, Groq AI, Back-to-Top, Theme, Itinerary & Comparison
   ======================================================== */

// Immediate Theme Initialization (executes prior to full render to avoid flash)
(function applyInitialTheme() {
    try {
        const savedTheme = localStorage.getItem("africa_world_theme");
        if (savedTheme === "dark") {
            document.body.classList.add("dark-mode");
            document.documentElement.classList.add("dark-mode");
        } else if (savedTheme === "light") {
            document.body.classList.remove("dark-mode");
            document.documentElement.classList.remove("dark-mode");
        } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
            document.body.classList.add("dark-mode");
            document.documentElement.classList.add("dark-mode");
        }
    } catch (e) {
        console.warn("Theme storage access not available:", e);
    }
})();

document.addEventListener("DOMContentLoaded", () => {

    initHeaderUserProfile();

    const countUpElements = document.querySelectorAll(".glance-card h3[data-count]");
    if (countUpElements.length) {
        const numberFormatter = new Intl.NumberFormat("en-US");
        const prefersReducedMotion = window.matchMedia &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        const startCountUp = (element) => {
            const target = Number(element.dataset.count);
            const suffix = element.dataset.suffix || "";

            if (!Number.isFinite(target)) return;
            if (prefersReducedMotion) {
                element.textContent = `${numberFormatter.format(target)}${suffix}`;
                return;
            }

            const duration = 1600;
            const startTime = performance.now();
            element.textContent = `0${suffix}`;

            const updateCount = (currentTime) => {
                const progress = Math.min((currentTime - startTime) / duration, 1);
                const easedProgress = 1 - Math.pow(1 - progress, 3);
                const currentValue = Math.floor(target * easedProgress);
                element.textContent = `${numberFormatter.format(currentValue)}${suffix}`;

                if (progress < 1) requestAnimationFrame(updateCount);
            };

            requestAnimationFrame(updateCount);
        };

        if ("IntersectionObserver" in window) {
            const counterObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        startCountUp(entry.target);
                        counterObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.6 });

            countUpElements.forEach((element) => counterObserver.observe(element));
        } else {
            countUpElements.forEach(startCountUp);
        }
    }

    /* ========================================================
       1. TYPEWRITER EFFECT: Rotating Words & Phrases
       ======================================================== */
    const typewriterEl = document.getElementById("typewriterText");
    if (typewriterEl) {
        const phrases = [
            "Africa & The World",
            "Ancient Civilizations & Heritage",
            "UNESCO World Heritage Trails",
            "From Nile Valley to Great Zimbabwe",
            "Pan-African Cultural Chronicles"
        ];
        let phraseIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        const typeLoop = () => {
            const currentPhrase = phrases[phraseIndex];

            if (isDeleting) {
                charIndex--;
                typewriterEl.textContent = currentPhrase.substring(0, charIndex);
            } else {
                charIndex++;
                typewriterEl.textContent = currentPhrase.substring(0, charIndex);
            }

            let typeSpeed = isDeleting ? 40 : 80;

            if (!isDeleting && charIndex === currentPhrase.length) {
                typeSpeed = 2200;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                typeSpeed = 400;
            }

            setTimeout(typeLoop, typeSpeed);
        };

        typewriterEl.textContent = "";
        setTimeout(typeLoop, 300);
    }

    /* ========================================================
       2. HERO 4-IMAGE INFINITE AUTO-SWAP CAROUSEL
       ======================================================== */
    const heroSlides = document.querySelectorAll(".hero-slide");
    const heroDots = document.querySelectorAll(".hero-dot");

    if (heroSlides.length > 1) {
        let currentSlide = 0;
        let slideTimer;

        const showSlide = (index) => {
            heroSlides.forEach((slide, i) => {
                slide.classList.toggle("active", i === index);
            });
            heroDots.forEach((dot, i) => {
                dot.classList.toggle("active", i === index);
            });
            currentSlide = index;
        };

        const nextSlide = () => {
            const nextIndex = (currentSlide + 1) % heroSlides.length;
            showSlide(nextIndex);
        };

        const startSlideShow = () => {
            clearInterval(slideTimer);
            slideTimer = setInterval(nextSlide, 4500);
        };

        heroDots.forEach((dot) => {
            dot.addEventListener("click", () => {
                const targetIndex = Number(dot.getAttribute("data-index"));
                if (!isNaN(targetIndex)) {
                    showSlide(targetIndex);
                    startSlideShow();
                }
            });
        });

        startSlideShow();
    }

    /* ========================================================
       3. HERO SEARCH & "PLAN TRIP WITH DATE" ACTION
       ======================================================== */
    const heroDestinationInput = document.getElementById("heroDestinationInput");
    const heroDateInput = document.getElementById("heroDateInput");
    const heroPlanTripBtn = document.getElementById("heroPlanTripBtn");

    const handleHeroTripSearch = () => {
        const destination = heroDestinationInput ? heroDestinationInput.value.trim() : "";
        const date = heroDateInput ? heroDateInput.value : "";
        const params = new URLSearchParams();
        if (destination) params.set("country", destination);
        if (date) params.set("date", date);

        const targetUrl = `trip-planner.html${params.toString() ? "?" + params.toString() : ""}`;
        window.location.href = targetUrl;
    };

    if (heroPlanTripBtn) {
        heroPlanTripBtn.addEventListener("click", handleHeroTripSearch);
    }

    if (heroDestinationInput) {
        heroDestinationInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                handleHeroTripSearch();
            }
        });
    }

    // Pre-fill Trip Planner if redirected with query params
    const tripCountrySelect = document.getElementById("tripCountry");
    if (tripCountrySelect) {
        const urlParams = new URLSearchParams(window.location.search);
        const prefillCountry = urlParams.get("country");
        if (prefillCountry) {
            const matchOption = Array.from(tripCountrySelect.options).find(
                (opt) => opt.value.toLowerCase() === prefillCountry.toLowerCase()
            );
            if (matchOption) {
                tripCountrySelect.value = matchOption.value;
                tripCountrySelect.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }
    }

    /* ========================================================
       4. BACK TO TOP BUTTON
       ======================================================== */
    const backToTopBtn = document.getElementById("backToTopBtn");
    if (backToTopBtn) {
        window.addEventListener("scroll", () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add("visible");
            } else {
                backToTopBtn.classList.remove("visible");
            }
        }, { passive: true });

        backToTopBtn.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }

    /* ========================================================
       5. GROQ AI ASSISTANT (UNIVERSAL WIDGET)
       ======================================================== */
    const groqAiLauncher = document.getElementById("groqAiLauncher");
    const groqAiPanel = document.getElementById("groqAiPanel");
    const groqAiClose = document.getElementById("groqAiClose");
    const groqAiForm = document.getElementById("groqAiForm");
    const groqAiInput = document.getElementById("groqAiInput");
    const groqAiMessages = document.getElementById("groqAiMessages");

    if (groqAiLauncher && groqAiPanel && groqAiClose && groqAiForm && groqAiInput && groqAiMessages) {
        const groqConversation = [];
        const groqFallbackKey = localStorage.getItem("groq_api_key") || "";

        const setGroqPanelOpen = (isOpen) => {
            groqAiPanel.hidden = !isOpen;
            if (isOpen) {
                groqAiInput.focus();
            } else {
                groqAiLauncher.focus();
            }
        };

        groqAiLauncher.addEventListener("click", () => setGroqPanelOpen(true));
        groqAiClose.addEventListener("click", () => setGroqPanelOpen(false));

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && !groqAiPanel.hidden) {
                setGroqPanelOpen(false);
            }
        });

        // Prompt pills quick click
        document.querySelectorAll(".groq-prompt-pill").forEach((pill) => {
            pill.addEventListener("click", () => {
                groqAiInput.value = pill.textContent.trim();
                groqAiForm.dispatchEvent(new Event("submit", { cancelable: true }));
            });
        });

        /* Lightweight markdown → HTML renderer for bot messages */
        const renderMarkdown = (text) => {
            // Escape HTML entities first (for safety)
            const esc = (s) => s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

            // Split into lines for block-level processing
            const lines = text.split("\n");
            let html = "";
            let i = 0;

            while (i < lines.length) {
                const line = lines[i];

                // --- Headings ---
                const h3 = line.match(/^###\s+(.+)/);
                const h2 = line.match(/^##\s+(.+)/);
                const h1 = line.match(/^#\s+(.+)/);
                if (h1) { html += `<h1 class="am-h1">${inlineFormat(h1[1])}</h1>`; i++; continue; }
                if (h2) { html += `<h2 class="am-h2">${inlineFormat(h2[1])}</h2>`; i++; continue; }
                if (h3) { html += `<h3 class="am-h3">${inlineFormat(h3[1])}</h3>`; i++; continue; }

                // --- Info Card Grid Layout (Transforms any table data into a clean, modern card design) ---
                if (/^\|.+\|/.test(line) && i + 1 < lines.length && /^\|[-| :]+\|/.test(lines[i + 1])) {
                    const headers = line.split("|").filter(c => c.trim() !== "").map(c => c.trim());
                    i += 2; // skip header + separator
                    let cardsHtml = "";
                    while (i < lines.length && /^\|.+\|/.test(lines[i])) {
                        const cells = lines[i].split("|").filter(c => c.trim() !== "").map(c => c.trim());
                        if (cells.length > 0) {
                            let fieldsHtml = "";
                            cells.forEach((cell, idx) => {
                                const label = headers[idx] ? `<strong>${inlineFormat(headers[idx])}:</strong> ` : "";
                                fieldsHtml += `<div class="am-info-field">${label}<span>${inlineFormat(cell)}</span></div>`;
                            });
                            cardsHtml += `<div class="am-info-card">${fieldsHtml}</div>`;
                        }
                        i++;
                    }
                    html += `<div class="am-info-grid">${cardsHtml}</div>`;
                    continue;
                }

                // --- Unordered list ---
                if (/^[-*•]\s/.test(line)) {
                    let items = "";
                    while (i < lines.length && /^[-*•]\s/.test(lines[i])) {
                        items += `<li>${inlineFormat(lines[i].replace(/^[-*•]\s/, ""))}</li>`;
                        i++;
                    }
                    html += `<ul class="am-ul">${items}</ul>`;
                    continue;
                }

                // --- Ordered list ---
                if (/^\d+\.\s/.test(line)) {
                    let items = "";
                    while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
                        items += `<li>${inlineFormat(lines[i].replace(/^\d+\.\s/, ""))}</li>`;
                        i++;
                    }
                    html += `<ol class="am-ol">${items}</ol>`;
                    continue;
                }

                // --- Horizontal rule ---
                if (/^---+$/.test(line.trim())) {
                    html += `<hr class="am-hr">`;
                    i++; continue;
                }

                // --- Blank line (paragraph break) ---
                if (line.trim() === "") {
                    i++; continue;
                }

                // --- Regular paragraph ---
                html += `<p class="am-p">${inlineFormat(line)}</p>`;
                i++;
            }
            return html;
        };

        /* Inline formatting: bold, italic, code, links */
        const inlineFormat = (text) => {
            const esc = (s) => s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
            return esc(text)
                // inline code
                .replace(/`([^`]+)`/g, "<code class=\"am-code\">$1</code>")
                // bold+italic
                .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
                // bold
                .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                .replace(/__(.+?)__/g, "<strong>$1</strong>")
                // italic
                .replace(/\*(.+?)\*/g, "<em>$1</em>")
                .replace(/_(.+?)_/g, "<em>$1</em>");
        };

        const appendGroqMsg = (text, type = "bot", isRaw = false) => {
            const msgEl = document.createElement("div");
            msgEl.className = `groq-msg groq-msg-${type}`;
            if (type === "bot" && !isRaw) {
                msgEl.innerHTML = renderMarkdown(text);
            } else {
                msgEl.textContent = text;
            }
            groqAiMessages.append(msgEl);
            groqAiMessages.scrollTop = groqAiMessages.scrollHeight;
            return msgEl;
        };

        groqAiForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const query = groqAiInput.value.trim();
            if (!query) return;

            appendGroqMsg(query, "user");
            groqAiInput.value = "";
            groqAiInput.disabled = true;

            const sendBtn = groqAiForm.querySelector("button");
            if (sendBtn) sendBtn.disabled = true;

            const thinkingMsg = document.createElement("div");
            thinkingMsg.className = "groq-msg groq-msg-bot am-thinking";
            thinkingMsg.innerHTML = `<span class="am-thinking-text">Afrimax Ai is thinking</span><span class="am-thinking-dots"><span></span><span></span><span></span></span>`;
            groqAiMessages.append(thinkingMsg);
            groqAiMessages.scrollTop = groqAiMessages.scrollHeight;

            try {
                let replyText = "";

                // Attempt serverless API route first
                let serverSuccess = false;
                try {
                    const res = await fetch("/api/groq-chat", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            message: query,
                            history: groqConversation.slice(-6)
                        })
                    });

                    if (res.ok) {
                        const data = await res.json();
                        if (data && data.reply) {
                            replyText = data.reply;
                            serverSuccess = true;
                        }
                    }
                } catch {
                    serverSuccess = false;
                }

                // If running locally without Vercel serverless function, use client-side Groq fallback
                if (!serverSuccess) {
                    const clientRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${groqFallbackKey}`
                        },
                        body: JSON.stringify({
                            model: "openai/gpt-oss-120b",
                            messages: [
                                {
                                    role: "system",
                                    content: "You are Afrimax AI, the dedicated educational AI assistant for Africa & The World. You are an expert on African civilizations (Kush, Aksum, Mali, Songhai, Benin, Great Zimbabwe, Swahili coast), the slave trade and resistance (Haitian Revolution, Queen Nzinga), anticolonial struggles, African literature (Achebe, Morrison, Kincaid, Equiano, Douglass), and website features. IMPORTANT LAYOUT RULE: Do NOT use table format or markdown table layouts (| col | col |) under any circumstances. Always present answers using a visually pleasing layout: clear headings (### Title), well-spaced bullet lists with bold lead-ins, clean paragraphs, and structured summary cards. Be accurate, eloquent, concise, and helpful."
                                },
                                ...groqConversation.slice(-6).map((turn) => ({
                                    role: turn.role,
                                    content: turn.text
                                })),
                                { role: "user", content: query }
                            ],
                            max_tokens: 800,
                            temperature: 0.6
                        })
                    });

                    if (!clientRes.ok) {
                        throw new Error(`Groq returned status ${clientRes.status}`);
                    }

                    const clientData = await clientRes.json();
                    replyText = clientData.choices?.[0]?.message?.content?.trim();
                }

                thinkingMsg.remove();
                if (replyText) {
                    appendGroqMsg(replyText, "bot");
                    groqConversation.push({ role: "user", text: query });
                    groqConversation.push({ role: "assistant", text: replyText });

                    // Check if inquiry requested booking or reservation
                    const isBookingQuery = /book|reservation|reserve|itinerary booking|safari booking|expedition booking/i.test(query);
                    if (isBookingQuery) {
                        try {
                            const storedUser = JSON.parse(localStorage.getItem('africa_world_customer') || '{}');
                            const bookings = JSON.parse(localStorage.getItem('africa_world_bookings') || '[]');
                            const bookingId = `AI-TRIP-${Math.floor(1000 + Math.random() * 9000)}`;
                            const newAiBooking = {
                                id: bookingId,
                                travelerName: storedUser.name || "Cultural Explorer",
                                travelerEmail: storedUser.email || "traveler@africaworld.org",
                                serviceTitle: query.length > 55 ? query.slice(0, 55) + "..." : query,
                                destination: "Pan-African Cultural Trail",
                                bookedVia: "Afrimax AI Assistant",
                                aiNotes: `Afrimax AI session dialogue: "${query}". Traveler requested itinerary booking assistance.`,
                                dateBooked: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                                travelDates: "Scheduled 2026/2027",
                                amount: "$1,850.00",
                                status: "AI Confirmed"
                            };
                            bookings.unshift(newAiBooking);
                            localStorage.setItem('africa_world_bookings', JSON.stringify(bookings));

                            setTimeout(() => {
                                const confirmCard = document.createElement("div");
                                confirmCard.className = "groq-msg groq-msg-bot";
                                confirmCard.style.border = "1.5px solid #10b981";
                                confirmCard.style.background = "#f0fdf4";
                                confirmCard.style.borderRadius = "12px";
                                confirmCard.style.padding = "12px 16px";
                                confirmCard.style.marginTop = "8px";
                                confirmCard.innerHTML = `
                                    <div style="display:flex; align-items:center; gap:8px; color:#047857; font-weight:700; margin-bottom:6px;">
                                        <i class="fas fa-circle-check"></i>
                                        <span>AI Expedition Booking Dispatched!</span>
                                    </div>
                                    <p style="font-size:12.5px; color:#1f2937; margin:0 0 6px 0; line-height:1.4;">
                                        Booking reference <strong>#${bookingId}</strong> has been logged into the curator operations portal.
                                    </p>
                                    <div style="font-size:11px; color:#047857; display:flex; justify-content:space-between; align-items:center;">
                                        <span>Status: <strong>AI Confirmed</strong></span>
                                        <a href="user-dashboard.html" style="color:#047857; font-weight:600; text-decoration:underline;">View in Portal &rarr;</a>
                                    </div>
                                `;
                                groqAiMessages.append(confirmCard);
                                groqAiMessages.scrollTop = groqAiMessages.scrollHeight;
                            }, 400);
                        } catch (e) {
                            console.warn("AI booking local sync note:", e);
                        }
                    }
                } else {
                    appendGroqMsg("I couldn't retrieve a response. Please ask again.", "bot");
                }
            } catch (err) {
                thinkingMsg.remove();
                console.error("Afrimax AI Error:", err);
                appendGroqMsg("Afrimax AI encountered an issue. Please try again.", "bot");
            } finally {
                groqAiInput.disabled = false;
                if (sendBtn) sendBtn.disabled = false;
                groqAiInput.focus();
            }
        });
    }

    /* ========================================================
       6. EDITORIAL MOSAIC GALLERY FILTERING (gallery.html)
       ======================================================== */
    window.rebindGalleryInteractions = function() {
        const editorialFilterBtns = document.querySelectorAll(".editorial-filter-btn");
        const mosaicTiles = document.querySelectorAll(".mosaic-item");
        const mosaicBlocks = document.querySelectorAll(".mosaic-block");
        const lightbox = document.getElementById("galleryLightbox");
        const lightboxImage = document.getElementById("galleryLightboxImage");
        const lightboxCaption = document.getElementById("galleryLightboxCaption");
        const lightboxClose = document.getElementById("galleryLightboxClose");

        if (lightbox && lightboxImage && lightboxClose) {
            const closeLightbox = () => {
                lightbox.classList.remove("is-open");
                lightbox.setAttribute("aria-hidden", "true");
                document.body.style.overflow = "";
            };

            mosaicTiles.forEach((tile) => {
                if (tile._hasClickBound) return;
                tile._hasClickBound = true;
                tile.addEventListener("click", () => {
                    const beforeImage = tile.querySelector(".mosaic-before-image");
                    const showingBefore = beforeImage && getComputedStyle(beforeImage).opacity === "1";
                    const image = showingBefore ? beforeImage : tile.querySelector("img");
                    if (!image) return;
                    lightboxImage.src = image.src;
                    lightboxImage.alt = image.alt || "Gallery image";
                    if (lightboxCaption) lightboxCaption.textContent = tile.querySelector(".mosaic-title")?.textContent || image.alt;
                    lightbox.classList.add("is-open");
                    lightbox.setAttribute("aria-hidden", "false");
                    document.body.style.overflow = "hidden";
                    lightboxClose.focus();
                });
            });

            if (!lightboxClose._hasClickBound) {
                lightboxClose._hasClickBound = true;
                lightboxClose.addEventListener("click", closeLightbox);
                lightbox.addEventListener("click", (event) => {
                    if (event.target === lightbox) closeLightbox();
                });
                document.addEventListener("keydown", (event) => {
                    if (event.key === "Escape" && lightbox.classList.contains("is-open")) closeLightbox();
                });
            }
        }

        if (editorialFilterBtns.length && mosaicTiles.length) {
            editorialFilterBtns.forEach((btn) => {
                if (btn._hasClickBound) return;
                btn._hasClickBound = true;
                btn.addEventListener("click", () => {
                    editorialFilterBtns.forEach((b) => b.classList.remove("active"));
                    btn.classList.add("active");

                    const filter = btn.getAttribute("data-filter");

                    document.querySelectorAll(".mosaic-item").forEach((tile) => {
                        const cat = (tile.getAttribute("data-category") || "").toLowerCase();
                        if (filter === "all" || cat === filter) {
                            tile.style.display = "block";
                        } else {
                            tile.style.display = "none";
                        }
                    });

                    // Check each mosaic block and hide blocks with no visible tiles
                    document.querySelectorAll(".mosaic-block").forEach((block) => {
                        const visibleTiles = block.querySelectorAll(".mosaic-item:not([style*='display: none'])");
                        if (visibleTiles.length > 0) {
                            block.style.display = "grid";
                        } else {
                            block.style.display = "none";
                        }
                    });
                });
            });
        }
    };

    window.rebindGalleryInteractions();

    /* ========================================================
       7. DARK / LIGHT MODE TOGGLE
       ======================================================== */
    const darkModeBtn = document.getElementById("darkModeBtn");

    const updateDarkModeIcon = (isDark) => {
        if (!darkModeBtn) return;
        const icon = darkModeBtn.querySelector("i");
        if (!icon) return;

        if (isDark) {
            icon.classList.remove("fa-moon");
            icon.classList.add("fa-sun");
            darkModeBtn.setAttribute("aria-label", "Switch to light mode");
            darkModeBtn.setAttribute("title", "Switch to light mode");
        } else {
            icon.classList.remove("fa-sun");
            icon.classList.add("fa-moon");
            darkModeBtn.setAttribute("aria-label", "Switch to dark mode");
            darkModeBtn.setAttribute("title", "Switch to dark mode");
        }
    };

    if (darkModeBtn) {
        updateDarkModeIcon(document.body.classList.contains("dark-mode"));

        darkModeBtn.addEventListener("click", () => {
            const isDark = document.body.classList.toggle("dark-mode");
            document.documentElement.classList.toggle("dark-mode", isDark);
            try {
                localStorage.setItem("africa_world_theme", isDark ? "dark" : "light");
            } catch (e) {
                console.warn("Failed saving theme to localStorage:", e);
            }
            updateDarkModeIcon(isDark);
        });
    }

    /* ========================================================
       8. MOBILE HAMBURGER MENU & DROPDOWN ACCORDION
       ======================================================== */
    const menuBtn = document.getElementById("menuBtn");
    const mainNav = document.getElementById("mainNav");

    if (menuBtn && mainNav) {
        menuBtn.addEventListener("click", () => {
            const isOpen = mainNav.classList.toggle("active");
            const icon = menuBtn.querySelector("i");
            if (icon) {
                if (isOpen) {
                    icon.classList.remove("fa-bars");
                    icon.classList.add("fa-xmark");
                    menuBtn.setAttribute("aria-expanded", "true");
                } else {
                    icon.classList.remove("fa-xmark");
                    icon.classList.add("fa-bars");
                    menuBtn.setAttribute("aria-expanded", "false");
                }
            }
        });
    }

    /* ========================================================
       9. "OTHER SOURCES" DROPDOWN INTERACTION
       ======================================================== */
    const dropdownContainers = document.querySelectorAll(".nav-item-dropdown");

    dropdownContainers.forEach((dropdown) => {
        const toggleBtn = dropdown.querySelector(".dropdown-toggle");
        const menu = dropdown.querySelector(".dropdown-menu");

        if (!toggleBtn || !menu) return;

        toggleBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const isOpen = dropdown.classList.toggle("open");
            toggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });

        dropdown.addEventListener("mouseleave", () => {
            if (window.innerWidth > 1200) {
                dropdown.classList.remove("open");
                toggleBtn.setAttribute("aria-expanded", "false");
            }
        });
    });

    document.addEventListener("click", (e) => {
        if (!e.target.closest(".nav-item-dropdown")) {
            dropdownContainers.forEach((dropdown) => {
                dropdown.classList.remove("open");
                const toggle = dropdown.querySelector(".dropdown-toggle");
                if (toggle) toggle.setAttribute("aria-expanded", "false");
            });
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            dropdownContainers.forEach((dropdown) => {
                dropdown.classList.remove("open");
                const toggle = dropdown.querySelector(".dropdown-toggle");
                if (toggle) toggle.setAttribute("aria-expanded", "false");
            });
            if (mainNav && mainNav.classList.contains("active")) {
                mainNav.classList.remove("active");
                if (menuBtn) {
                    const icon = menuBtn.querySelector("i");
                    if (icon) {
                        icon.classList.remove("fa-xmark");
                        icon.classList.add("fa-bars");
                    }
                    menuBtn.setAttribute("aria-expanded", "false");
                }
            }
        }
    });

    document.querySelectorAll("#mainNav a:not(.dropdown-toggle)").forEach((link) => {
        link.addEventListener("click", () => {
            if (mainNav && window.innerWidth <= 1200) {
                mainNav.classList.remove("active");
                if (menuBtn) {
                    const icon = menuBtn.querySelector("i");
                    if (icon) {
                        icon.classList.remove("fa-xmark");
                        icon.classList.add("fa-bars");
                    }
                    menuBtn.setAttribute("aria-expanded", "false");
                }
            }
        });
    });

    /* ========================================================
       10. CONTACT FORM
       ======================================================== */
    const contactForm = document.getElementById("contactForm");
    const contactSuccessMsg = document.getElementById("contactSuccessMsg");

    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();
            if (contactSuccessMsg) {
                contactSuccessMsg.style.display = "block";
                contactSuccessMsg.innerHTML = '<i class="fas fa-circle-check"></i> Thank you! Your message has been received. Our team will review your inquiry shortly.';
            }
            contactForm.reset();
        });
    }

    /* ========================================================
       11. TRIP PLANNER & GEMINI ASSISTANT
       ======================================================== */
    const tripPlannerForm = document.getElementById("tripPlannerForm");
    const tripPlannerResult = document.getElementById("tripPlannerResult");

    if (tripPlannerForm && tripPlannerResult) {
        tripPlannerForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const formData = new FormData(tripPlannerForm);
            const country = formData.get("country");
            const duration = Number(formData.get("duration"));
            const interest = formData.get("interest");

            const countryIsListed = Array.from(
                tripPlannerForm.elements.country.options
            ).some((option) => option.value === country);

            if (!country || !countryIsListed) {
                tripPlannerForm.reportValidity();
                return;
            }

            tripPlannerResult.replaceChildren();
            tripPlannerResult.hidden = false;

            const outputGrid = document.createElement("div");
            outputGrid.className = "trip-planner-output-grid";

            const itinerary = document.createElement("section");
            itinerary.className = "trip-itinerary";

            const heading = document.createElement("h3");
            heading.textContent = `${duration}-day trip plan for ${country}`;
            itinerary.append(heading);

            const description = document.createElement("p");
            description.textContent =
                `Customize your days below. This ${interest}-focused itinerary is a curated educational starting point; travel times and operating hours may vary.`;
            itinerary.append(description);

            const activities = {
                "history and heritage": [
                    "Explore a landmark historic site, national monument, or royal palace with an accredited local guide.",
                    "Visit the national archaeological museum; inspect ancient manuscripts, bronze arts, and pre-colonial artifacts.",
                    "Walk through the historic old town, UNESCO World Heritage quarter, or community memorial landscape.",
                    "Tour local architectural landmarks, sacred sites, and centers of regional governance.",
                    "Engage with local historians, artisanal guilds, and oral storytellers preserving communal traditions."
                ],
                "culture and food": [
                    "Get oriented in the city center; experience traditional central markets and artisan spice bazaars.",
                    "Participate in a regional culinary cooking masterclass featuring authentic ancestral recipes.",
                    "Attend a live musical performance showcasing traditional instruments (kora, balafon, djembe, or mbira).",
                    "Explore neighborhood craft cooperatives, textile weavers, and indigenous contemporary art galleries.",
                    "Savor regional hospitality at historical heritage tea houses and community-led dining cooperatives."
                ],
                "nature and wildlife": [
                    "Embark on a guided eco-safari or conservation hike; observe indigenous flora and protected wildlife.",
                    "Explore scenic rift valleys, waterfalls, mountain trails, or national botanical reserves.",
                    "Meet local conservation rangers to learn about community-led environmental protection initiatives.",
                    "Take a sunrise birdwatching excursion and explore wetland or savannah biodiversity.",
                    "Enjoy sunset panoramic viewpoints overlooking dramatic natural African landscapes."
                ],
                "coast and relaxation": [
                    "Settle into the coastal region; stroll along pristine beaches and historic shoreline battlements.",
                    "Cruise along coastal archipelagos or estuaries in a traditional wooden dhow or sailing canoe.",
                    "Visit coastal Swahili or maritime trading outposts, coral stone mosques, or colonial coastal fortresses.",
                    "Enjoy fresh ocean seafood prepared with indigenous regional herbs and coconut spices.",
                    "Unwind with a tranquil coastal sunset, seaside meditation, or artisan souvenir exploration."
                ]
            };

            const defaultActivities = [];
            for (let day = 1; day <= duration; day += 1) {
                const activityIndex = (day - 1) % activities[interest].length;
                let activity;
                if (day === 1) {
                    activity = `Arrive, get oriented in ${country}, adjust to the local environment and explore your immediate neighborhood at an easy pace.`;
                } else if (day === duration) {
                    activity = `Enjoy a farewell market visit for local artisan souvenirs, review trip memories, and prepare for comfortable departure.`;
                } else {
                    activity = activities[interest][activityIndex];
                }
                defaultActivities.push(activity);
            }

            const dayPlan = document.createElement("ol");
            dayPlan.className = "trip-plan-days";

            const renderDays = () => {
                dayPlan.replaceChildren();

                defaultActivities.forEach((activity, index) => {
                    const item = document.createElement("li");
                    item.className = "trip-plan-day";

                    const dayHeader = document.createElement("div");
                    dayHeader.className = "trip-plan-day-header";

                    const dayHeading = document.createElement("h4");
                    dayHeading.textContent = `Day ${index + 1}`;

                    const removeButton = document.createElement("button");
                    removeButton.type = "button";
                    removeButton.className = "trip-plan-remove-day";
                    removeButton.textContent = "Remove day";
                    removeButton.disabled = defaultActivities.length === 1;
                    removeButton.setAttribute("aria-label", `Remove day ${index + 1}`);
                    removeButton.addEventListener("click", () => {
                        defaultActivities.splice(index, 1);
                        renderDays();
                    });

                    dayHeader.append(dayHeading, removeButton);

                    const activityEditor = document.createElement("textarea");
                    activityEditor.value = activity;
                    activityEditor.setAttribute("aria-label", `Edit activities for day ${index + 1}`);
                    activityEditor.addEventListener("input", () => {
                        defaultActivities[index] = activityEditor.value;
                    });

                    item.append(dayHeader, activityEditor);
                    dayPlan.append(item);
                });
            };

            renderDays();
            itinerary.append(dayPlan);

            const addDayButton = document.createElement("button");
            addDayButton.type = "button";
            addDayButton.className = "trip-plan-add-day";
            addDayButton.innerHTML = '<i class="fas fa-plus"></i> Add a day to itinerary';
            addDayButton.addEventListener("click", () => {
                if (defaultActivities.length >= 30) return;
                const nextAct = activities[interest][(defaultActivities.length) % activities[interest].length];
                defaultActivities.push(nextAct);
                renderDays();
            });
            itinerary.append(addDayButton);

            // Auto-save itinerary to Supabase database & synchronized booking store
            const saveItineraryToSupabase = (isManual = false) => {
                try {
                    const storedUser = JSON.parse(localStorage.getItem('africa_world_customer') || '{}');
                    const bookings = JSON.parse(localStorage.getItem('africa_world_bookings') || '[]');
                    const tripId = `TRIP-${country.toUpperCase().slice(0, 3)}-${duration}D-${Math.floor(1000 + Math.random() * 9000)}`;
                    
                    const newTripRecord = {
                        id: tripId,
                        travelerName: storedUser.name || "Explorer",
                        travelerEmail: storedUser.email || "traveler@africaworld.org",
                        serviceTitle: `${duration}-Day ${country} (${interest}) Custom Itinerary`,
                        destination: country,
                        travelDates: `${duration} Days (Flexible 2026/2027)`,
                        amount: `$${(duration * 280).toLocaleString()}.00`,
                        bookedVia: "Web Itinerary Builder",
                        aiNotes: `Day-by-Day Activities:\n` + defaultActivities.map((act, i) => `Day ${i + 1}: ${act}`).join("\n"),
                        status: "AI Confirmed",
                        dateBooked: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    };

                    bookings.unshift(newTripRecord);
                    localStorage.setItem('africa_world_bookings', JSON.stringify(bookings));

                    const userTrips = JSON.parse(localStorage.getItem('africa_world_user_trips') || '[]');
                    userTrips.unshift(newTripRecord);
                    localStorage.setItem('africa_world_user_trips', JSON.stringify(userTrips));

                    // Direct Supabase insert attempt
                    if (window.supabase) {
                        try {
                            const sbUrl = localStorage.getItem('supabase_project_url') || 'https://tyqlywcwlmevjrptbde.supabase.co';
                            const sbKey = 'sb_publishable_tYQLywcwLMEVjrPTbDe_gA_VHC3UMkn';
                            const client = window.supabase.createClient(sbUrl, sbKey);
                            Promise.resolve(client.from('bookings').insert([newTripRecord])).catch(() => {});
                        } catch (e) {}
                    }

                    // Push real-time notification to admin operations stream
                    try {
                        const notifs = JSON.parse(localStorage.getItem('africa_world_notifications') || '[]');
                        notifs.unshift({
                            id: `notif-trip-${Date.now()}`,
                            title: "New AI Expedition Booked",
                            message: `${newTripRecord.travelerName} planned ${country} itinerary (#${tripId})`,
                            type: "booking",
                            time: "Just now",
                            timestamp: Date.now(),
                            read: false
                        });
                        if (notifs.length > 60) notifs.length = 60;
                        localStorage.setItem('africa_world_notifications', JSON.stringify(notifs));
                        window.dispatchEvent(new CustomEvent('africa_world_new_notification', { detail: notifs[0] }));
                    } catch(e) {}

                    if (isManual) {
                        alert(`Itinerary #${tripId} successfully re-synced to Supabase! You can review it in your User Dashboard and the Admin Portal.`);
                    }
                    return tripId;
                } catch(e) {
                    console.warn("Supabase trip save note:", e);
                    return `TRIP-${country.toUpperCase().slice(0, 3)}-${duration}D-8821`;
                }
            };

            const savedTripId = saveItineraryToSupabase(false);

            // Add Supabase sync card to the itinerary section
            const supabaseSyncCard = document.createElement("div");
            supabaseSyncCard.className = "trip-supabase-sync-card";
            supabaseSyncCard.innerHTML = `
                <div class="trip-supabase-sync-info">
                    <i class="fas fa-database" aria-hidden="true"></i>
                    <div>
                        <strong style="display:block; color:#065f46; font-size:0.95rem;">Saved to Supabase Database</strong>
                        <span style="font-size:0.8rem; color:#047857;">Reference: <strong>#${savedTripId}</strong> &bull; Synced with User Dashboard &amp; Admin Operations</span>
                    </div>
                </div>
                <button type="button" class="trip-supabase-btn" id="updateTripSupabaseBtn">
                    <i class="fas fa-cloud-arrow-up"></i>
                    <span>Re-sync Custom Days</span>
                </button>
            `;
            const updateBtn = supabaseSyncCard.querySelector("#updateTripSupabaseBtn");
            if (updateBtn) {
                updateBtn.addEventListener("click", () => {
                    saveItineraryToSupabase(true);
                });
            }
            itinerary.append(supabaseSyncCard);
            research.className = "trip-research-card";

            const researchHeading = document.createElement("h3");
            researchHeading.textContent = `${country}: Research & Travel Resources`;
            research.append(researchHeading);

            const researchIntro = document.createElement("p");
            researchIntro.textContent =
                "Use verified official sources for background, entry visas, and health requirements prior to travel.";
            research.append(researchIntro);

            const researchLinks = document.createElement("div");
            researchLinks.className = "trip-research-links";

            const createResearchLink = (label, url) => {
                const link = document.createElement("a");
                link.href = url;
                link.target = "_blank";
                link.rel = "noopener noreferrer";
                link.innerHTML = `${label} <i class="fas fa-arrow-up-right-from-square"></i>`;
                researchLinks.append(link);
            };

            const searchUrl = (query) => {
                const url = new URL("https://www.google.com/search");
                url.searchParams.set("q", query);
                return url.href;
            };

            const historyUrl = new URL("https://www.britannica.com/search");
            historyUrl.searchParams.set("query", `${country} history`);

            const heritageUrl = searchUrl(`site:whc.unesco.org ${country} heritage`);
            const travelGuideUrl = new URL("https://en.wikivoyage.org/w/index.php");
            travelGuideUrl.searchParams.set("search", country);
            const mapUrl = new URL("https://www.google.com/maps/search/");
            mapUrl.searchParams.set("api", "1");
            mapUrl.searchParams.set("query", country);

            createResearchLink("Country history (Encyclopaedia Britannica)", historyUrl.href);
            createResearchLink("UNESCO World Heritage Sites search", heritageUrl);
            createResearchLink("Destination Travel Guide (Wikivoyage)", travelGuideUrl.href);
            createResearchLink("Explore Map Location", mapUrl.href);
            createResearchLink("U.S. State Department Travel Advisory", searchUrl(`site:travel.state.gov ${country} travel advisory`));
            createResearchLink("UK Foreign Travel Advice", searchUrl(`site:gov.uk/foreign-travel-advice ${country}`));
            createResearchLink("Official Visa & Immigration Portal Search", searchUrl(`${country} official government visa immigration rules`));
            createResearchLink("IATA Passport & Travel Health Guidance", "https://www.iatatravelcentre.com/");

            research.append(researchLinks);

            outputGrid.append(itinerary, research);
            tripPlannerResult.append(outputGrid);

            tripPlannerResult.scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            });
        });
    }

    /* ========================================================
       12. HISTORICAL COMPARISON ENGINE
       ======================================================== */
    const historicalData = {
        africa: {
            name: "Africa",
            icon: "fa-earth-africa",
            society: "Diverse civilizations ranging from decentralized egalitarian communities and age-grade confederacies to centralized empires (Mali, Songhai, Kush, Great Zimbabwe, Benin). Deep respect for ancestral lineages and communal governance.",
            trade: "Vibrant trans-Saharan trade connecting the Mediterranean to West Africa with gold, salt, and manuscripts; thriving Indian Ocean monsoon trade connecting Swahili city-states to Arabia, India, and China.",
            slavery: "Historically featured kinship-based and tributary dependency; radically disrupted and devastated by the Transatlantic Slave Trade and Indian Ocean trades which commodified tens of millions of human beings.",
            education: "Rich oral traditions preserved by Griots (jeliw); world-renowned centers of scholarship and Islamic jurisprudence such as the University of Sankore in Timbuktu, Al-Qarawiyyin in Fez, and Ez-Zitouna in Tunis.",
            politics: "Diverse political structures including sacred monarchies, council-guided kingships (Oyo Empire's Oyo Mesi), matriarchal leadership (Queen Amanirenas of Kush, Queen Nzinga), and participatory village assemblies."
        },
        europe: {
            name: "Europe",
            icon: "fa-earth-europe",
            society: "Evolved from feudal vassalage and agrarian manorialism to mercantilism, urban guilds, and the rise of the bourgeois nation-state following the Renaissance and Enlightenment periods.",
            trade: "Dominated Mediterranean, Baltic (Hanseatic League), and Atlantic trade routes; expansion of maritime mercantilist charters (East India companies) that financed colonial expeditions globally.",
            slavery: "Transformed from ancient Greco-Roman and medieval serfdom into the violent transatlantic chattel slave system, legally defining human beings as inheritable personal property.",
            education: "Scholasticism centered in cathedral schools and medieval universities (Bologna, Paris, Oxford); later transformed by the printing press, Scientific Revolution, and secular academies.",
            politics: "Shifted from feudal monarchies and the Holy Roman Empire toward absolute monarchies, constitutional parliamentary systems, and imperial colonialist states."
        },
        asia: {
            name: "Asia",
            icon: "fa-earth-asia",
            society: "Extremely diverse civilizations including imperial dynasties in China, caste and guild-based societies in India, nomadic steppe confederations, and maritime kingdoms in Southeast Asia.",
            trade: "The legendary Silk Road linked East Asia, Central Asia, and the Levant; vast Indian Ocean maritime networks traded silk, porcelain, spices, textiles, and precious gems.",
            slavery: "Included bonded labor, debt servitude, and domestic servitude across varying legal codes, alongside state-managed military enslavement systems like the Mamluks.",
            education: "Ancient institutions of higher learning including Nalanda University, Taxila, imperial civil service examination academies (Hanlin Academy), and Persian madrassas.",
            politics: "Encompassed centralized bureaucratic dynasties (Tang, Song, Ming), Persianate empires (Safavids, Mughals), decentralized feudal shogunates in Japan, and maritime sultanates."
        },
        americas: {
            name: "Americas",
            icon: "fa-earth-americas",
            society: "Thriving Indigenous civilizations (Maya, Aztec, Inca, Mississippian, Haudenosaunee Confederacy) prior to 1492 with sophisticated agricultural terraces, urban engineering, and communal land tenure.",
            trade: "Extensive regional networks including the Inca Qhapaq Ñan road system, obsidian and turquoise trade across Mesoamerica, and riverine trade networks throughout North America.",
            slavery: "Indigenous tribute labor was radically displaced by catastrophic European colonization, the encomienda system, and the brutal plantation chattel slavery of African descendants.",
            education: "Indigenous astronomical observatories (Maya glyphs and codices, quipu recording in the Andes), deep ecological knowledge systems, and oral generational wisdom.",
            politics: "Ranged from democratic confederacies (Iroquois Great Law of Peace) to complex imperial states with sophisticated administrative hierarchies (Inca Tahuantinsuyu, Aztec Triple Alliance)."
        }
    };

    const compareBtn = document.getElementById("compareBtn");
    const comparisonResult = document.getElementById("comparisonResult");

    if (compareBtn && comparisonResult) {
        compareBtn.addEventListener("click", () => {
            const region1El = document.getElementById("region1");
            const region2El = document.getElementById("region2");
            if (!region1El || !region2El) return;

            const region1Key = region1El.value;
            const region2Key = region2El.value;

            const data1 = historicalData[region1Key];
            const data2 = historicalData[region2Key];
            if (!data1 || !data2) return;

            comparisonResult.innerHTML = `
                <div class="comparison-grid">
                    <div class="comparison-card">
                        <h3><i class="fas ${data1.icon}"></i> ${data1.name.toUpperCase()}</h3>
                        <div class="comparison-item">
                            <strong>Society &amp; Demographics</strong>
                            <p>${data1.society}</p>
                        </div>
                        <div class="comparison-item">
                            <strong>Trade &amp; Economy</strong>
                            <p>${data1.trade}</p>
                        </div>
                        <div class="comparison-item">
                            <strong>Labor &amp; Slavery Systems</strong>
                            <p>${data1.slavery}</p>
                        </div>
                        <div class="comparison-item">
                            <strong>Knowledge, Education &amp; Science</strong>
                            <p>${data1.education}</p>
                        </div>
                        <div class="comparison-item">
                            <strong>Governance &amp; Political Structures</strong>
                            <p>${data1.politics}</p>
                        </div>
                    </div>

                    <div class="comparison-card">
                        <h3><i class="fas ${data2.icon}"></i> ${data2.name.toUpperCase()}</h3>
                        <div class="comparison-item">
                            <strong>Society &amp; Demographics</strong>
                            <p>${data2.society}</p>
                        </div>
                        <div class="comparison-item">
                            <strong>Trade &amp; Economy</strong>
                            <p>${data2.trade}</p>
                        </div>
                        <div class="comparison-item">
                            <strong>Labor &amp; Slavery Systems</strong>
                            <p>${data2.slavery}</p>
                        </div>
                        <div class="comparison-item">
                            <strong>Knowledge, Education &amp; Science</strong>
                            <p>${data2.education}</p>
                        </div>
                        <div class="comparison-item">
                            <strong>Governance &amp; Political Structures</strong>
                            <p>${data2.politics}</p>
                        </div>
                    </div>
                </div>
            `;
            comparisonResult.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
    }

    /* ========================================================
       DOCUMENTARY TRAVEL ITINERARY CONTROLLER (videos.html)
       (Matching Uploaded Reference Image & Interactive Side Map)
       ======================================================== */
    const horizontalVideoTrack = document.getElementById("videoHorizontalTrack");
    const itineraryCardList = document.getElementById("itineraryCardList");
    const itineraryMapWrap = document.getElementById("itineraryMapWrap");
    const itineraryRegionBadge = document.getElementById("itineraryRegionBadge");
    const itineraryTagline = document.getElementById("itineraryTagline");
    const itineraryCuratorTip = document.getElementById("itineraryCuratorTip");
    const spotlightImg = document.getElementById("spotlightImg");
    const spotlightTitle = document.getElementById("spotlightTitle");
    const spotlightSub = document.getElementById("spotlightSub");

    if (horizontalVideoTrack && itineraryCardList && itineraryMapWrap) {
        const itineraryData = {
            ancient: {
                tagline: "Best for exploring deep history, architectural wonders, and royal dynasties.",
                badge: "NILE & RIFT VALLEY",
                tip: "This documentary expedition is best experienced sequentially. Follow the architectural timeline from Kushite stone masonry to medieval Ge'ez rock-cutting and Shona granite ramparts.",
                mapSvg: `
                    <svg viewBox="0 0 400 380" class="itinerary-map-svg" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <radialGradient id="waterGrad1" cx="65%" cy="40%" r="60%">
                                <stop offset="0%" stop-color="#d4e6d7" stop-opacity="0.9" />
                                <stop offset="70%" stop-color="#b6d5bd" stop-opacity="0.6" />
                                <stop offset="100%" stop-color="#9fc4a8" stop-opacity="0.3" />
                            </radialGradient>
                            <filter id="watercolorFilter1" x="-10%" y="-10%" width="120%" height="120%">
                                <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
                                <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" />
                            </filter>
                        </defs>
                        <!-- Stylized Nile & East African Landmass -->
                        <path d="M 120,40 C 190,20 280,35 310,70 C 340,110 320,160 300,210 C 270,280 250,330 200,350 C 150,360 120,310 100,260 C 80,210 70,160 90,110 C 100,80 110,50 120,40 Z" fill="url(#waterGrad1)" filter="url(#watercolorFilter1)" />
                        <!-- Coastal contours -->
                        <path d="M 310,70 Q 330,120 300,180 T 260,290" fill="none" stroke="#274735" stroke-width="1.5" stroke-opacity="0.3" />
                        <!-- Route Trail (Dashed connecting 1 -> 2 -> 3) -->
                        <path id="routeTrailPath" class="map-trail-path" d="M 180,85 C 240,120 270,160 250,200 C 230,240 210,270 195,305" />
                        <!-- Pin 1: Nile Valley / Kush (180, 85) -->
                        <g class="map-pin-group active" data-pin="1" transform="translate(180, 85)">
                            <circle class="map-pin-circle" r="14" />
                            <text class="map-pin-text">1</text>
                        </g>
                        <!-- Pin 2: Lalibela / Ethiopia (250, 200) -->
                        <g class="map-pin-group" data-pin="2" transform="translate(250, 200)">
                            <circle class="map-pin-circle" r="14" />
                            <text class="map-pin-text">2</text>
                        </g>
                        <!-- Pin 3: Great Zimbabwe (195, 305) -->
                        <g class="map-pin-group" data-pin="3" transform="translate(195, 305)">
                            <circle class="map-pin-circle" r="14" />
                            <text class="map-pin-text">3</text>
                        </g>
                    </svg>
                `,
                docs: [
                    {
                        num: 1,
                        icon: "fa-landmark",
                        title: "Africa's Great Civilizations",
                        tag: "PBS • 6-Part Series • Free",
                        desc: "Hosted by Prof. Henry Louis Gates Jr., this milestone 6-hour documentary charts 200,000 years of African history, from human origins through the empires of Kush, Aksum, Great Zimbabwe, and the Kingdom of Kongo.",
                        img: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80",
                        place: "Nile Valley & Kingdom of Kush",
                        sub: "Sudan & Upper Nile • c. 300 BCE",
                        yt: "https://www.youtube.com/results?search_query=Africa%27s+Great+Civilizations+Henry+Louis+Gates"
                    },
                    {
                        num: 2,
                        icon: "fa-church",
                        title: "Lost Kingdoms of Africa",
                        tag: "BBC • 4-Part Series • Free",
                        desc: "British art historian Dr. Gus Casely-Hayford journeys through the archaeological ruins and artistic treasures of the Kingdom of Kush, Great Zimbabwe, medieval Ethiopia's rock-hewn churches of Lalibela, and West Africa.",
                        img: "https://images.unsplash.com/photo-1589802829985-817e51171b92?auto=format&fit=crop&w=800&q=80",
                        place: "Lalibela Rock Sanctuaries",
                        sub: "Amhara Region, Ethiopia • 12th Century",
                        yt: "https://www.youtube.com/results?search_query=Lost+Kingdoms+of+Africa+BBC"
                    },
                    {
                        num: 3,
                        icon: "fa-mountain-sun",
                        title: "Africa: A Voyage of Discovery",
                        tag: "Pioneering TV • 8 Episodes • Free",
                        desc: "Renowned historian Basil Davidson's legendary 1984 series—one of the earliest major television productions to refute colonial myths by demonstrating Africa's independent cultural, technological, and political evolution.",
                        img: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=800&q=80",
                        place: "The Great Enclosure",
                        sub: "Masvingo, Zimbabwe • 11th–15th Century",
                        yt: "https://www.youtube.com/results?search_query=Basil+Davidson+Africa+A+Voyage+of+Discovery"
                    }
                ]
            },
            "slave-trade": {
                tagline: "Best for maritime history, underwater recovery, and liberation revolutions.",
                badge: "ATLANTIC PASSAGE",
                tip: "Pair these documentaries with the Trans-Atlantic Slave Trade Database (Voyages) to trace verified maritime coordinates, captive revolts, and survivor narratives.",
                mapSvg: `
                    <svg viewBox="0 0 400 380" class="itinerary-map-svg" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <radialGradient id="waterGrad2" cx="40%" cy="50%" r="65%">
                                <stop offset="0%" stop-color="#b8d8c2" stop-opacity="0.85" />
                                <stop offset="70%" stop-color="#96c5a3" stop-opacity="0.6" />
                                <stop offset="100%" stop-color="#73aa84" stop-opacity="0.3" />
                            </radialGradient>
                            <filter id="watercolorFilter2" x="-10%" y="-10%" width="120%" height="120%">
                                <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
                                <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" />
                            </filter>
                        </defs>
                        <!-- Ocean & Coastal Basin -->
                        <path d="M 60,60 C 120,40 220,50 310,90 C 350,150 330,220 290,290 C 230,340 130,350 70,300 C 40,240 30,150 60,60 Z" fill="url(#waterGrad2)" filter="url(#watercolorFilter2)" />
                        <!-- Transatlantic Maritime Route -->
                        <path class="map-trail-path" d="M 280,110 C 220,180 180,210 160,240 C 130,280 100,290 80,180" />
                        <!-- Pin 1: Maritime Shipwreck / Diving (280, 110) -->
                        <g class="map-pin-group active" data-pin="1" transform="translate(280, 110)">
                            <circle class="map-pin-circle" r="14" />
                            <text class="map-pin-text">1</text>
                        </g>
                        <!-- Pin 2: Saint-Domingue / Haiti (80, 180) -->
                        <g class="map-pin-group" data-pin="2" transform="translate(80, 180)">
                            <circle class="map-pin-circle" r="14" />
                            <text class="map-pin-text">2</text>
                        </g>
                        <!-- Pin 3: Gorée Island / Diaspora Shrines (160, 240) -->
                        <g class="map-pin-group" data-pin="3" transform="translate(160, 240)">
                            <circle class="map-pin-circle" r="14" />
                            <text class="map-pin-text">3</text>
                        </g>
                    </svg>
                `,
                docs: [
                    {
                        num: 1,
                        icon: "fa-anchor",
                        title: "Enslaved: The Lost History",
                        tag: "Epix / BBC • 6 Episodes • Free",
                        desc: "Hosted by Samuel L. Jackson and featuring maritime divers from Diving With a Purpose, this series locates sunken slave ships across the Atlantic and recovers the human stories behind the 400-year trade.",
                        img: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
                        place: "Atlantic Shipwreck Recovery",
                        sub: "Mid-Atlantic Ocean • Maritime Archaeology",
                        yt: "https://www.youtube.com/results?search_query=Enslaved+Samuel+L+Jackson+documentary"
                    },
                    {
                        num: 2,
                        icon: "fa-fire",
                        title: "Égalité for All: Toussaint Louverture",
                        tag: "PBS • Historical Special • Free",
                        desc: "A vivid historical chronicle of the Haitian Revolution. Analyzes how enslaved sugar plantation laborers defeated three European empires to forge the world's first independent Black republic.",
                        img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
                        place: "Citadelle Laferrière & Massif",
                        sub: "Northern Haiti • 1791–1804 Revolution",
                        yt: "https://www.youtube.com/results?search_query=Egalite+for+All+Toussaint+Louverture+Haitian+Revolution"
                    },
                    {
                        num: 3,
                        icon: "fa-drum",
                        title: "The Slave Route: Soul of Resistance",
                        tag: "UNESCO • Educational Archive • Free",
                        desc: "Produced under UNESCO's Slave Route Project, this documentary examines the intangible cultural heritage, musical rhythms, spiritual systems, and linguistic retentions preserved across the African diaspora.",
                        img: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
                        place: "Gorée Island & Diaspora Shrines",
                        sub: "Dakar Bay, Senegal • Memory & Rhythms",
                        yt: "https://www.youtube.com/results?search_query=UNESCO+The+Slave+Route+The+Soul+of+Resistance"
                    }
                ]
            },
            anticolonial: {
                tagline: "Best for 20th-century geopolitical revolution, guerrilla warfare, and sovereign independence.",
                badge: "PAN-AFRICAN AXIS",
                tip: "Examines declassified archival films and primary speeches from Patrice Lumumba, Amílcar Cabral, and Frantz Fanon during the global tide of anticolonial liberation.",
                mapSvg: `
                    <svg viewBox="0 0 400 380" class="itinerary-map-svg" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <radialGradient id="waterGrad3" cx="50%" cy="40%" r="60%">
                                <stop offset="0%" stop-color="#cadfc9" stop-opacity="0.9" />
                                <stop offset="70%" stop-color="#a3c4a2" stop-opacity="0.6" />
                                <stop offset="100%" stop-color="#80a87f" stop-opacity="0.3" />
                            </radialGradient>
                            <filter id="watercolorFilter3" x="-10%" y="-10%" width="120%" height="120%">
                                <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
                                <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" />
                            </filter>
                        </defs>
                        <!-- Continental Contour -->
                        <path d="M 130,30 C 220,20 290,50 310,100 C 330,160 300,230 270,290 C 220,350 170,360 140,320 C 100,270 80,180 90,110 C 100,60 110,40 130,30 Z" fill="url(#waterGrad3)" filter="url(#watercolorFilter3)" />
                        <!-- Revolutionary Axis Trail Line -->
                        <path class="map-trail-path" d="M 190,70 C 230,140 210,190 200,210 C 190,240 220,290 190,320" />
                        <!-- Pin 1: Casbah of Algiers (190, 70) -->
                        <g class="map-pin-group active" data-pin="1" transform="translate(190, 70)">
                            <circle class="map-pin-circle" r="14" />
                            <text class="map-pin-text">1</text>
                        </g>
                        <!-- Pin 2: Congo River / Kinshasa (200, 210) -->
                        <g class="map-pin-group" data-pin="2" transform="translate(200, 210)">
                            <circle class="map-pin-circle" r="14" />
                            <text class="map-pin-text">2</text>
                        </g>
                        <!-- Pin 3: Southern African Frontline (190, 320) -->
                        <g class="map-pin-group" data-pin="3" transform="translate(190, 320)">
                            <circle class="map-pin-circle" r="14" />
                            <text class="map-pin-text">3</text>
                        </g>
                    </svg>
                `,
                docs: [
                    {
                        num: 1,
                        icon: "fa-bullhorn",
                        title: "The Battle of Algiers (1966)",
                        tag: "Cinema Classic • Award Winning • Free",
                        desc: "Gillo Pontecorvo's gripping masterwork reconstructing the Algerian National Liberation Front's (FLN) urban guerrilla campaign against French colonial occupation in the Casbah of Algiers.",
                        img: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
                        place: "Casbah of Algiers",
                        sub: "Algiers Province, Algeria • 1954–1962",
                        yt: "https://www.youtube.com/results?search_query=The+Battle+of+Algiers+full+movie"
                    },
                    {
                        num: 2,
                        icon: "fa-user-tie",
                        title: "Lumumba: Death of a Prophet",
                        tag: "Historical Essay • Raoul Peck • Free",
                        desc: "Acclaimed filmmaker Raoul Peck examines the life, visionary pan-African leadership, and covert international assassination of the Democratic Republic of the Congo's first democratically elected Prime Minister, Patrice Lumumba.",
                        img: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80",
                        place: "Congo River & Kinshasa",
                        sub: "Democratic Republic of the Congo • 1960–1961",
                        yt: "https://www.youtube.com/results?search_query=Lumumba+Death+of+a+Prophet+Raoul+Peck"
                    },
                    {
                        num: 3,
                        icon: "fa-book-open",
                        title: "Concerning Violence (2014)",
                        tag: "Archival Essay • Frantz Fanon • Free",
                        desc: "Narrated by Lauryn Hill, this visual documentary essay sets Frantz Fanon's seminal text The Wretched of the Earth against newly discovered Swedish television archival footage of liberation struggles in Angola, Mozambique, and Guinea-Bissau.",
                        img: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=800&q=80",
                        place: "Lusophone Frontline Archives",
                        sub: "Angola & Mozambique • Liberation Era",
                        yt: "https://www.youtube.com/results?search_query=Concerning+Violence+Frantz+Fanon+documentary"
                    }
                ]
            }
        };

        // Sync custom / modified documentary videos from Admin CMS
        try {
            const rawVideos = localStorage.getItem("africa_world_videos");
            if (rawVideos) {
                const storedVideos = JSON.parse(rawVideos);
                ["ancient", "slave-trade", "anticolonial"].forEach((trk) => {
                    const trackVideos = storedVideos.filter((v) => v.track === trk);
                    if (trackVideos.length && itineraryData[trk]) {
                        itineraryData[trk].docs = trackVideos.map((v, idx) => ({
                            num: parseInt(v.num, 10) || (idx + 1),
                            icon: v.icon || "fa-video",
                            title: v.title,
                            tag: v.tag || "Curated Archival Screening",
                            desc: v.desc || "",
                            img: v.img || "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80",
                            place: v.place || "African Historical Heritage",
                            sub: v.sub || "Documentary Record",
                            yt: v.yt || "https://www.youtube.com"
                        }));
                    }
                });
            }
        } catch (e) {
            console.warn("Could not sync custom documentary videos:", e);
        }

        let currentTrackKey = "ancient";
        let isProgrammaticScroll = false;
        let scrollDebounce = null;

        // Select a specific destination card & highlight matching map pin and side image
        function selectCard(pinNum, trackKey, shouldScrollCard = false) {
            const track = itineraryData[trackKey];
            if (!track) return;
            const doc = track.docs.find((d) => d.num === pinNum) || track.docs[0];

            // 1. Update active card in list
            const cards = itineraryCardList.querySelectorAll(".itinerary-dest-card");
            cards.forEach((c) => {
                const cNum = parseInt(c.getAttribute("data-index"), 10);
                if (cNum === pinNum) {
                    c.classList.add("active");
                    if (shouldScrollCard) {
                        isProgrammaticScroll = true;
                        c.scrollIntoView({ behavior: "smooth", block: "nearest" });
                        setTimeout(() => { isProgrammaticScroll = false; }, 400);
                    }
                } else {
                    c.classList.remove("active");
                }
            });

            // 2. Update active pin in SVG map
            const pinGroups = itineraryMapWrap.querySelectorAll(".map-pin-group");
            pinGroups.forEach((p) => {
                const pNum = parseInt(p.getAttribute("data-pin"), 10);
                if (pNum === pinNum) {
                    p.classList.add("active");
                } else {
                    p.classList.remove("active");
                }
            });

            // 3. Update side photo spotlight with cross-fade
            if (spotlightImg && spotlightTitle && spotlightSub) {
                spotlightImg.style.opacity = "0.3";
                setTimeout(() => {
                    spotlightImg.src = doc.img;
                    spotlightImg.alt = doc.title;
                    spotlightTitle.textContent = doc.place;
                    spotlightSub.textContent = doc.sub;
                    spotlightImg.style.opacity = "1";
                }, 160);
            }
        }

        // Render whole track when user clicks a horizontal item
        function renderItineraryTrack(trackKey) {
            const track = itineraryData[trackKey];
            if (!track) return;
            currentTrackKey = trackKey;

            // Reset scroll position of card container without jumping the whole webpage
            itineraryCardList.scrollTop = 0;

            // Update horizontal button states
            const hItems = horizontalVideoTrack.querySelectorAll(".h-video-item");
            hItems.forEach((btn) => {
                if (btn.getAttribute("data-track") === trackKey) {
                    btn.classList.add("active");
                } else {
                    btn.classList.remove("active");
                }
            });

            // Update side info
            if (itineraryTagline) itineraryTagline.textContent = track.tagline;
            if (itineraryRegionBadge) itineraryRegionBadge.textContent = track.badge;
            if (itineraryCuratorTip) itineraryCuratorTip.textContent = track.tip;

            // Render SVG map
            itineraryMapWrap.innerHTML = track.mapSvg;

            // Render destination cards matching image
            let cardsHtml = "";
            track.docs.forEach((doc, idx) => {
                cardsHtml += `
                    <article class="itinerary-dest-card ${idx === 0 ? "active" : ""}" data-index="${doc.num}">
                        <div class="itinerary-dest-media">
                            <span class="dest-number-badge">${doc.num}</span>
                            <div class="dest-side-icon-badge">
                                <i class="fas ${doc.icon}" aria-hidden="true"></i>
                            </div>
                            <img class="itinerary-dest-img" src="${doc.img}" alt="${doc.title}" loading="lazy">
                        </div>
                        <div class="itinerary-dest-info">
                            <h3 class="itinerary-dest-title">${doc.title}</h3>
                            <div class="itinerary-dest-divider">
                                <i class="fas fa-diamond" aria-hidden="true"></i>
                            </div>
                            <span class="dest-price-pill">${doc.tag}</span>
                            <p class="itinerary-dest-desc">${doc.desc}</p>
                            <div class="itinerary-btn-row">
                                <a href="${doc.yt}" target="_blank" rel="noopener" class="btn-yt-watch">
                                    <i class="fab fa-youtube" aria-hidden="true"></i>
                                    Watch on YouTube
                                </a>
                                <button type="button" class="btn-trail-pin" data-pin-target="${doc.num}">
                                    <i class="fas fa-location-dot" aria-hidden="true"></i>
                                    Pin on Map
                                </button>
                            </div>
                        </div>
                    </article>
                `;
            });
            itineraryCardList.innerHTML = cardsHtml;

            // Attach click events to cards
            itineraryCardList.querySelectorAll(".itinerary-dest-card").forEach((card) => {
                card.addEventListener("click", (e) => {
                    // Avoid overriding direct external YouTube link click
                    if (e.target.closest(".btn-yt-watch")) return;
                    const num = parseInt(card.getAttribute("data-index"), 10);
                    selectCard(num, currentTrackKey, true);
                });
            });

            // Attach click events to pin buttons inside cards
            itineraryCardList.querySelectorAll(".btn-trail-pin").forEach((btn) => {
                btn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    const num = parseInt(btn.getAttribute("data-pin-target"), 10);
                    selectCard(num, currentTrackKey, true);
                });
            });

            // Attach click events to SVG map pins
            itineraryMapWrap.querySelectorAll(".map-pin-group").forEach((pinGroup) => {
                pinGroup.addEventListener("click", () => {
                    const num = parseInt(pinGroup.getAttribute("data-pin"), 10);
                    selectCard(num, currentTrackKey, true);
                });
            });

            // Initialize with first card selected
            selectCard(1, trackKey);
        }

        // Horizontal track items click listeners
        horizontalVideoTrack.querySelectorAll(".h-video-item").forEach((btn) => {
            btn.addEventListener("click", () => {
                const track = btn.getAttribute("data-track");
                renderItineraryTrack(track);
            });
        });

        // Sync active card and side map/images as user scrolls vertically within the video list
        itineraryCardList.addEventListener("scroll", () => {
            if (isProgrammaticScroll) return;
            clearTimeout(scrollDebounce);
            scrollDebounce = setTimeout(() => {
                const cards = itineraryCardList.querySelectorAll(".itinerary-dest-card");
                const containerRect = itineraryCardList.getBoundingClientRect();
                const containerCenter = containerRect.top + containerRect.height / 2;

                let closestCard = null;
                let minDistance = Infinity;

                cards.forEach((card) => {
                    const cardRect = card.getBoundingClientRect();
                    const cardCenter = cardRect.top + cardRect.height / 2;
                    const distance = Math.abs(containerCenter - cardCenter);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestCard = card;
                    }
                });

                if (closestCard) {
                    const num = parseInt(closestCard.getAttribute("data-index"), 10);
                    selectCard(num, currentTrackKey, false);
                }
            }, 120);
        }, { passive: true });

        // Initialize default track on load
        renderItineraryTrack("ancient");
    }

    /* ========================================================
       14. UNIVERSAL USER PROFILE HEADER & ACCOUNT DROPDOWN
       ======================================================== */
    function initHeaderUserProfile() {
        // Remove legacy Portals dropdown if present
        const legacyPortals = document.getElementById("portalsDropdownBtn")?.closest(".nav-item-dropdown");
        if (legacyPortals) legacyPortals.remove();

        let targets = document.querySelectorAll(".user-profile-nav");
        if (!targets.length) {
            const headerActions = document.querySelector(".header-actions");
            if (headerActions) {
                const navWrap = document.createElement("div");
                navWrap.className = "user-profile-nav";
                navWrap.id = "userProfileNav";
                headerActions.prepend(navWrap);
                targets = document.querySelectorAll(".user-profile-nav");
            }
        }

        const storedUser = localStorage.getItem("africa_world_customer");
        let user = null;
        if (storedUser) {
            try { user = JSON.parse(storedUser); } catch(e) {}
        }

        targets.forEach(container => {
            container.replaceChildren();

            if (user && (user.name || user.email)) {
                const displayName = user.name || user.email.split("@")[0] || "Traveler";
                const displayEmail = user.email || "Verified Member";
                const initial = displayName.charAt(0).toUpperCase();

                const btn = document.createElement("button");
                btn.type = "button";
                btn.className = "nav-user-dropdown-btn";
                btn.setAttribute("aria-expanded", "false");
                btn.setAttribute("title", `Account Menu: ${displayName}`);

                const avatarDiv = document.createElement("div");
                avatarDiv.className = "nav-user-avatar-pill";
                if (user.photoURL) {
                    const img = document.createElement("img");
                    img.src = user.photoURL;
                    img.alt = displayName;
                    avatarDiv.appendChild(img);
                } else {
                    avatarDiv.textContent = initial;
                }

                const nameSpan = document.createElement("span");
                nameSpan.className = "nav-user-label";
                nameSpan.textContent = displayName;

                const chevron = document.createElement("i");
                chevron.className = "fas fa-chevron-down";
                chevron.style.fontSize = "0.7rem";
                chevron.style.color = "var(--text-muted, #64748b)";

                btn.append(avatarDiv, nameSpan, chevron);

                const menu = document.createElement("div");
                menu.className = "nav-user-menu";
                menu.innerHTML = `
                    <div class="nav-user-header">
                        <strong>${displayName.replace(/</g, "&lt;")}</strong>
                        <span>${displayEmail.replace(/</g, "&lt;")}</span>
                    </div>
                    <a href="user-dashboard.html" class="nav-user-item">
                        <i class="fas fa-gauge-high"></i>
                        <span>User Dashboard</span>
                    </a>
                    <div class="nav-user-divider"></div>
                    <div class="nav-user-language-box" style="padding: 8px 14px 6px;">
                        <div style="font-size:11.5px; font-weight:700; color:var(--text-heading, #1f2937); margin-bottom:6px; display:flex; align-items:center; gap:6px;">
                            <i class="fas fa-language" style="color:var(--primary-color, #c87a1e); font-size:13px;"></i>
                            <span>Select Language</span>
                        </div>
                        <div id="google_translate_element"></div>
                    </div>
                    <div class="nav-user-divider"></div>
                    <button type="button" class="nav-user-item nav-user-logout" id="navLogoutActionBtn">
                        <i class="fas fa-arrow-right-from-bracket"></i>
                        <span>Log Out</span>
                    </button>
                `;

                btn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    const isOpen = menu.classList.toggle("is-active");
                    btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
                    if (isOpen) ensureGoogleTranslateLoaded();
                });

                const logoutAction = menu.querySelector("#navLogoutActionBtn");
                if (logoutAction) {
                    logoutAction.addEventListener("click", () => {
                        if (confirm("Log out of your Africa & The World account?")) {
                            localStorage.removeItem("africa_world_customer");
                            initHeaderUserProfile();
                            if (window.location.pathname.includes("user-dashboard")) {
                                window.location.href = "user-login.html";
                            }
                        }
                    });
                }

                container.append(btn, menu);
                ensureGoogleTranslateLoaded();
            } else {
                const signInLink = document.createElement("a");
                signInLink.href = "user-login.html";
                signInLink.className = "nav-signin-pill";
                signInLink.setAttribute("title", "Sign in to your member account");
                signInLink.innerHTML = `<i class="fas fa-circle-user"></i> <span>Sign In</span>`;

                const langBtn = document.createElement("div");
                langBtn.className = "nav-item-dropdown nav-guest-lang-dropdown";
                langBtn.style.marginRight = "6px";
                langBtn.innerHTML = `
                    <button class="dropdown-toggle" style="padding: 4px 8px; font-size: 12px; border-radius: 6px; border: 1px solid var(--border-color, #cbd5e1); background: var(--bg-card, #ffffff);" title="Translate website">
                        <i class="fas fa-language" style="color:var(--primary-color, #c87a1e);"></i>
                    </button>
                    <div class="dropdown-menu" style="min-width: 170px; padding: 10px;">
                        <span style="font-size:11px; font-weight:700; color:var(--text-muted); display:block; margin-bottom:4px;">Translate Page</span>
                        <div id="google_translate_element_guest"></div>
                    </div>
                `;

                container.append(langBtn, signInLink);
                ensureGoogleTranslateLoaded("google_translate_element_guest");
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener("click", () => {
            document.querySelectorAll(".nav-user-menu.is-active").forEach(m => m.classList.remove("is-active"));
            document.querySelectorAll(".nav-user-dropdown-btn").forEach(b => b.setAttribute("aria-expanded", "false"));
        });
    }

    function ensureGoogleTranslateLoaded(targetElementId = "google_translate_element") {
        if (!window.googleTranslateElementInit) {
            window.googleTranslateElementInit = function() {
                try {
                    if (window.google && window.google.translate) {
                        const targetId = document.getElementById("google_translate_element") 
                            ? "google_translate_element" 
                            : (document.getElementById("google_translate_element_guest") ? "google_translate_element_guest" : null);
                        if (targetId) {
                            new window.google.translate.TranslateElement({
                                pageLanguage: "en",
                                layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                                autoDisplay: false
                            }, targetId);
                        }
                    }
                } catch(e) {}
            };
        }
        if (!document.getElementById("google-translate-api")) {
            const script = document.createElement("script");
            script.id = "google-translate-api";
            script.type = "text/javascript";
            script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
            document.body.appendChild(script);
        } else if (window.google && window.google.translate && window.googleTranslateElementInit) {
            window.googleTranslateElementInit();
        }
    }

});
document.addEventListener('DOMContentLoaded', function () {
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');

    mobileMenuBtn.addEventListener('click', function () {
        navLinks.classList.toggle('active');
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });

                // Close mobile menu if open
                navLinks.classList.remove('active');
            }
        });
    });

    // Tab functionality
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            this.classList.add('active');

            // Hide all tab content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });

            // Show the corresponding tab content
            const tabId = this.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });

    // QR code size slider
    const sizeSlider = document.getElementById('qr-size');
    const sizeValue = document.getElementById('size-value');

    sizeSlider.addEventListener('input', function () {
        sizeValue.textContent = this.value + 'px';
    });

    let qrCode = null;
    let currentTab = 'url';

    // Logo upload preview
    const logoUpload = document.getElementById('qr-logo');
    logoUpload.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            // Check file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('File size exceeds 2MB limit. Please choose a smaller file.');
                this.value = ''; // Clear the file input
                return;
            }

            const reader = new FileReader();
            reader.onload = function (event) {
                const logoPreview = document.getElementById('qr-logo-preview');
                logoPreview.src = event.target.result;
                logoPreview.style.display = 'block';
            };
            reader.readAsDataURL(file);

            // Update the upload label
            const fileName = file.name.length > 20 ? file.name.substring(0, 17) + '...' : file.name;
            document.querySelector('.file-upload-label p').textContent = fileName;
        }
    });

    // Generate QR code
    window.generateQR = function () {
        const size = document.getElementById('qr-size').value;
        const color1 = document.getElementById('color1').value;
        const color2 = document.getElementById('color2').value;
        const errorLevel = document.getElementById('error-level').value;

        // Determine which tab is active and get content
        const activeTab = document.querySelector('.tab-content.active').id;
        currentTab = activeTab;
        let qrContent = '';

        switch (activeTab) {
            case 'url-tab':
                qrContent = document.getElementById('qr-url').value.trim();
                if (!qrContent) {
                    alert('Please enter a URL for the QR code');
                    return;
                }
                if (!qrContent.startsWith('http')) {
                    qrContent = 'https://' + qrContent;
                }
                break;
            case 'text-tab':
                qrContent = document.getElementById('qr-text').value.trim();
                if (!qrContent) {
                    alert('Please enter text for the QR code');
                    return;
                }
                break;
            case 'contact-tab':
                const contact = {
                    name: document.getElementById('contact-name').value.trim(),
                    phone: document.getElementById('contact-phone').value.trim(),
                    email: document.getElementById('contact-email').value.trim(),
                    company: document.getElementById('contact-company').value.trim()
                };

                if (!contact.name && !contact.phone && !contact.email) {
                    alert('Please enter at least one contact detail (name, phone, or email)');
                    return;
                }

                qrContent = `BEGIN:VCARD\nVERSION:3.0\n`;
                if (contact.name) qrContent += `N:${contact.name}\n`;
                if (contact.phone) qrContent += `TEL:${contact.phone}\n`;
                if (contact.email) qrContent += `EMAIL:${contact.email}\n`;
                if (contact.company) qrContent += `ORG:${contact.company}\n`;
                qrContent += `END:VCARD`;
                break;
            case 'wifi-tab':
                const wifi = {
                    ssid: document.getElementById('wifi-ssid').value.trim(),
                    password: document.getElementById('wifi-password').value.trim(),
                    security: document.getElementById('wifi-security').value
                };

                if (!wifi.ssid) {
                    alert('Please enter a WiFi network name (SSID)');
                    return;
                }

                qrContent = `WIFI:T:${wifi.security};S:${wifi.ssid}`;
                if (wifi.password) qrContent += `;P:${wifi.password}`;
                qrContent += `;;`;
                break;
            case 'sms-tab':
                const sms = {
                    number: document.getElementById('sms-number').value.trim(),
                    message: document.getElementById('sms-message').value.trim()
                };

                if (!sms.number) {
                    alert('Please enter a phone number for the SMS');
                    return;
                }

                qrContent = `SMSTO:${sms.number}`;
                if (sms.message) qrContent += `:${sms.message}`;
                break;
            case 'email-tab':
                const email = {
                    address: document.getElementById('email-address').value.trim(),
                    subject: document.getElementById('email-subject').value.trim(),
                    body: document.getElementById('email-body').value.trim()
                };

                if (!email.address) {
                    alert('Please enter an email address');
                    return;
                }

                qrContent = `MATMSG:TO:${email.address}`;
                if (email.subject) qrContent += `;SUB:${email.subject}`;
                if (email.body) qrContent += `;BODY:${email.body}`;
                qrContent += `;;`;
                break;
        }

        // Show the QR code container
        document.getElementById('qrcode').style.display = 'block';

        // Clear previous QR code if exists
        if (qrCode) {
            qrCode.clear();
            document.getElementById('qr-preview').innerHTML = '';
        }

        // Generate new QR code with proper scaling
        const qrContainer = document.getElementById('qr-preview');
        qrContainer.style.width = size + 'px';
        qrContainer.style.height = size + 'px';

        qrCode = new QRCode(qrContainer, {
            text: qrContent,
            width: parseInt(size),
            height: parseInt(size),
            colorDark: color1,
            colorLight: color2,
            correctLevel: QRCode.CorrectLevel[errorLevel]
        });

        // Show the action buttons
        document.getElementById('action-buttons').style.display = 'flex';

        // Hide the share container if it's open
        document.getElementById('share-container').innerHTML = '';

        // Scroll to the QR code
        document.getElementById('qrcode').scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    // Download QR code
    window.downloadQR = function (format) {
        if (!qrCode) {
            alert('Please generate a QR code first');
            return;
        }

        const canvas = document.querySelector('#qr-preview canvas');
        if (!canvas) {
            alert('QR code not generated properly');
            return;
        }

        // Determine file name based on content type
        let fileName = 'qrcode';
        switch (currentTab) {
            case 'url-tab':
                const url = document.getElementById('qr-url').value.trim();
                if (url) {
                    const domain = url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
                    fileName = domain || 'qrcode';
                }
                break;
            case 'text-tab':
                fileName = 'text-qrcode';
                break;
            case 'contact-tab':
                fileName = 'contact-qrcode';
                break;
            case 'wifi-tab':
                fileName = 'wifi-qrcode';
                break;
            case 'sms-tab':
                fileName = 'sms-qrcode';
                break;
            case 'email-tab':
                fileName = 'email-qrcode';
                break;
        }

        if (format === 'png') {
            const link = document.createElement('a');
            link.download = `${fileName}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } else if (format === 'svg') {
            // In a real implementation, you would convert canvas to SVG here
            // For this demo, we'll just download a PNG but name it SVG
            const link = document.createElement('a');
            link.download = `${fileName}.svg`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }
    };

    // Share QR code
    window.shareQR = function () {
        if (!qrCode) {
            alert('Please generate a QR code first');
            return;
        }

        const shareContainer = document.getElementById('share-container');
        shareContainer.innerHTML = `
            <h3 style="font-size: 1.5rem; margin-bottom: 2rem;">Share Your QR Code</h3>
            <div class="share-options">
                <button class="share-btn facebook-btn" onclick="shareOnFacebook()">
                    <i class="fab fa-facebook-f"></i> Facebook
                </button>
                <button class="share-btn twitter-btn" onclick="shareOnTwitter()">
                    <i class="fab fa-twitter"></i> Twitter
                </button>
                <button class="share-btn whatsapp-btn" onclick="shareOnWhatsApp()">
                    <i class="fab fa-whatsapp"></i> WhatsApp
                </button>
                <button class="share-btn copy-btn" onclick="copyQR()">
                    <i class="fas fa-copy"></i> Copy Image
                </button>
            </div>
            <div class="link-container">
                <input type="text" id="qr-link" placeholder="QR code link will appear here" readonly>
                <button class="btn" onclick="copyLink()" style="padding: 0.75rem 1.5rem;">
                    <i class="fas fa-copy"></i> Copy
                </button>
            </div>
        `;

        // Generate a data URL for the QR code
        const canvas = document.querySelector('#qr-preview canvas');
        if (canvas) {
            document.getElementById('qr-link').value = canvas.toDataURL('image/png');
        }
    };

    // Template selection
    window.selectTemplate = function (templateType) {
        const templates = {
            'business': {
                color1: '#2b2d42',
                color2: '#f8f9fa',
                size: 300,
                text: 'https://yourbusiness.com'
            },
            'social': {
                color1: '#3a86ff',
                color2: '#ffbe0b',
                size: 300,
                text: 'https://twitter.com/yourprofile'
            },
            'minimal': {
                color1: '#000000',
                color2: '#ffffff',
                size: 300,
                text: 'Your minimal text here'
            },
            'event': {
                color1: '#7209b7',
                color2: '#fef9e7',
                size: 280,
                text: 'Event: Annual Conference\nDate: 2024-06-15\nLocation: Convention Center'
            },
            'restaurant': {
                color1: '#e85d04',
                color2: '#fdf2e9',
                size: 270,
                text: 'https://yourrestaurant.com/menu'
            },
            'product': {
                color1: '#2d6a4f',
                color2: '#e8f8f5',
                size: 260,
                text: 'Product: Premium Coffee\nPrice: $12.99\nCode: COFFEE123'
            }
        };

        const template = templates[templateType];
        document.getElementById('color1').value = template.color1;
        document.getElementById('color2').value = template.color2;
        document.getElementById('qr-size').value = template.size;
        document.getElementById('size-value').textContent = template.size + 'px';

        // Set content based on active tab
        const activeTab = document.querySelector('.tab.active').getAttribute('data-tab');
        switch (activeTab) {
            case 'url':
                document.getElementById('qr-url').value = template.text;
                break;
            case 'text':
                document.getElementById('qr-text').value = template.text;
                break;
            case 'contact':
                document.getElementById('contact-name').value = 'John Doe';
                document.getElementById('contact-phone').value = '+1234567890';
                document.getElementById('contact-email').value = 'john@example.com';
                document.getElementById('contact-company').value = 'Example Corp';
                break;
            case 'wifi':
                document.getElementById('wifi-ssid').value = 'MyWiFiNetwork';
                document.getElementById('wifi-password').value = 'securepassword';
                break;
            case 'sms':
                document.getElementById('sms-number').value = '+1234567890';
                document.getElementById('sms-message').value = 'Hello, I would like more information!';
                break;
            case 'email':
                document.getElementById('email-address').value = 'contact@example.com';
                document.getElementById('email-subject').value = 'Inquiry';
                document.getElementById('email-body').value = 'Hello, I would like more information about...';
                break;
        }

        generateQR();
    };

    // Share functions
    window.copyQR = function () {
        const canvas = document.querySelector('#qr-preview canvas');
        if (!canvas) {
            alert('QR code not available for copying');
            return;
        }

        canvas.toBlob(function (blob) {
            navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
            ]).then(() => {
                alert('QR code copied to clipboard!');
            }).catch(err => {
                console.error('Failed to copy QR code:', err);
                alert('Failed to copy QR code. Please try again.');
            });
        });
    };

    window.copyLink = function () {
        const linkInput = document.getElementById('qr-link');
        if (!linkInput || !linkInput.value) {
            alert('No QR code link available to copy');
            return;
        }

        linkInput.select();
        document.execCommand('copy');

        // Show tooltip or confirmation
        const copyBtn = linkInput.nextElementSibling;
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';

        setTimeout(() => {
            copyBtn.innerHTML = originalText;
        }, 2000);
    };

    window.shareOnFacebook = function () {
        const text = encodeURIComponent("Check out this QR code I created with QRGenius!");
        window.open(`https://www.facebook.com/sharer/sharer.php?quote=${text}`, '_blank');
    };

    window.shareOnTwitter = function () {
        const text = encodeURIComponent("Check out this QR code I created with QRGenius!");
        window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
    };

    window.shareOnWhatsApp = function () {
        const text = encodeURIComponent("Check out this QR code I created with QRGenius!");
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    // Initialize with empty QR code container (hidden until generation)
    document.getElementById('qrcode').style.display = 'none';
    document.getElementById('action-buttons').style.display = 'none';
});
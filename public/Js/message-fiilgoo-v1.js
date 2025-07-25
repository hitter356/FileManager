function createMessage(options) {
    const { text, type, timer, location, align, backcolor, color, image, timercolor, waitToClose } = options;

    const messageContainer = document.createElement('div');
    messageContainer.className = `message-fillgoo ${type}`;
    messageContainer.style.backgroundColor = backcolor;
    messageContainer.style.color = color;
    messageContainer.style.position = 'fixed';

    // مکان‌دهی به صورت عمودی و افقی
    if (align === 'center') {
        messageContainer.classList.add('center');
    } else {
        messageContainer.style[align] = '20px'; // موقعیت X
    }

    if (location === 'middle') {
        messageContainer.classList.add('middle');
    } else {
        messageContainer.style[location] = '20px'; // موقعیت Y
    }

    messageContainer.style.zIndex = 2147483600;

    const messageContent = `
        <span id="messageFillgoo">
            <div id="messageFillgooN1">
                <img src="${image || '#'}" alt="Message icon">
                <h3 dir="rtl" style="color: ${color};">${text}</h3>
            </div>
            <div class="message-fillgoo-timer" id="progressBarMessage"></div>
        </span>
    `;

    messageContainer.innerHTML = messageContent;
    document.body.appendChild(messageContainer);

    // تنظیم تایمر رنگ
    const progressBar = messageContainer.querySelector('#progressBarMessage');
    progressBar.style.width = '100%';
    progressBar.style.height = '5px';
    progressBar.style.backgroundColor = color || 'red';

    // اگر تایمر مشخص شده بود، نوار تایمر را به روزرسانی کن
    if (timer) {
        let timeLeft = timer * 1000; // تبدیل ثانیه به میلی‌ثانیه
        const interval = setInterval(() => {
            timeLeft -= 100;
            progressBar.style.width = `${(timeLeft / (timer * 1000)) * 100}%`;

            if (timeLeft <= 0 && !waitToClose) {
                clearInterval(interval);
                messageContainer.classList.add('fade-out');
                setTimeout(() => messageContainer.remove(), 500); // زمان انیمیشن
            }
        }, 100);
    }
    
    // تابع برای بستن پیام به صورت دستی با انیمیشن
    messageContainer.closeMessage = function() {
        messageContainer.classList.add('fade-out');
        setTimeout(() => messageContainer.remove(), 500); // زمان انیمیشن
    };

    // بازگرداندن عنصر پیام برای کنترل بیشتر
    return messageContainer;
}

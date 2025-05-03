function spinWheel() {
    const wheel = document.getElementById('wheel');
    const randomDegree = Math.floor(1000 + Math.random() * 1000);
    wheel.style.transform = `rotate(${randomDegree}deg)`;
}

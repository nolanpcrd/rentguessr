export async function generateResultImage(score: number, maxScore: number): Promise<Blob | null> {
    const canvas = document.createElement('canvas');
    const width = 1080;
    const height = 1080;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    ctx.fillStyle = '#FFC567';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#ffffff';
    ctx.font = '80px "Lilita One", sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 10;
    ctx.fillText('RentGuessr', width / 2, 200);
    ctx.shadowBlur = 0;

    const cardWidth = 600;
    const cardHeight = 400;
    const cardX = (width - cardWidth) / 2;
    const cardY = (height - cardHeight) / 2;

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardWidth, cardHeight, 25);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#000000';
    ctx.font = '40px "Lilita One", sans-serif';
    ctx.fillText('Mon score final', width / 2, cardY + 100);

    ctx.fillStyle = '#000000';
    ctx.font = '120px "Lilita One", sans-serif';
    ctx.fillText(`${score}`, width / 2, cardY + 220);

    ctx.fillStyle = '#666666';
    ctx.font = '40px "Lilita One", sans-serif';
    ctx.fillText(`sur ${maxScore} points`, width / 2, cardY + 300);

    ctx.fillStyle = '#ffffff';
    ctx.font = '40px "Lilita One", sans-serif';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 10;
    ctx.fillText('rentguessr.fun', width / 2, 950);

    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            resolve(blob);
        }, 'image/png');
    });
}

export async function shareResult(score: number, maxScore: number) {
    const blob = await generateResultImage(score, maxScore);
    if (!blob) return;

    const file = new File([blob], 'rentguessr-score.png', { type: 'image/png' });

    if (navigator.share && navigator.canShare({ files: [file] })) {
        try {
            await navigator.share({
                title: 'Mon score RentGuessr',
                text: `J'ai fait ${score} points sur RentGuessr ! Peux-tu faire mieux ?`,
                files: [file]
            });
        } catch (err) {
            console.error('Error sharing:', err);
            downloadImage(blob);
        }
    } else {
        downloadImage(blob);
    }
}

function downloadImage(blob: Blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rentguessr-score.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function shareOnTwitter(score: number, maxScore: number) {
    const text = `J'ai fait ${score}/${maxScore} points sur RentGuessr !\n\nEssaie de battre mon score :`;
    const url = 'https://rentguessr.fun';
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank');
}

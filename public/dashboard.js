const dataContent = [
    {
        img: "https://i.pinimg.com/originals/f7/9e/52/f79e5203f41bdaaf1a5b4176f98a8736.jpg",
        judul: "Penanganan Kesehatan",
        link: "penangananKesehatan",
        text: "dsfdfsdfsdf"
    },
    {
        img: "https://i.pinimg.com/originals/f7/9e/52/f79e5203f41bdaaf1a5b4176f98a8736.jpg",
        judul: "Pendeteksi Kesehatan",
        link: "pendeteksiKesehatan",
        text: "dfgdgdgdgtydrgdg"
    },{
        img: "https://i.pinimg.com/originals/f7/9e/52/f79e5203f41bdaaf1a5b4176f98a8736.jpg",
        judul: "Peta Cuaca",
        link: "petaCuaca",
        text: "dfgdgdgdgtydrgdg"
    },{
        img: "https://i.pinimg.com/originals/f7/9e/52/f79e5203f41bdaaf1a5b4176f98a8736.jpg",
        judul: "Riwayat Kesehatan",
        link: "riwayatKesehatan",
        text: "dfgdgdgdgtydrgdg"
    }
]

const contentEl = document.getElementById('content');

const dashboard = () => {
    let isi = '';
    dataContent.forEach((i) => {
        isi += `
            <a href="${i.link}.html" class="dalamContent">
                <img alt="${i.judul}" src="${i.img}" class="content-bg">
                <div class="content-overlay">
                    <h3>${i.judul}</h3>
                    <p>${i.text}</p>
                </div>
            </a>
        `;
    });
    contentEl.innerHTML = isi;
}
dashboard();
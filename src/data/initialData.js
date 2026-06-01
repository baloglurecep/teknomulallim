export const initialData = {
  profile: {
    name: "Teknomuallim",
    slogan: "Bilgiyi Aktarmakla Kalmıyor, Geleceği Kodluyor ve Üretiyoruz.",
    titles: ["Öğretmen", "Elektronik Geliştirici", "Teknoloji Mentoru"],
    aboutText: "Yıllarını eğitime vermiş bir öğretmen olarak, masanın sadece anlatan tarafında değil, üreten tarafında da yer alıyorum. Teorik bilgiyi pratik üretimle birleştirerek, öğrencilerimin geleceği sadece kullanan değil, inşa eden bireyler olmalarını hedefliyorum. Arduino, IoT ve özel yazılım çözümleriyle okul ve endüstri ihtiyaçlarına yenilikçi çözümler üretiyorum.",
    email: "baloglurecep30@hotmail.com, baloglurecep@gmail.com",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    instagram: "https://instagram.com",
    formSubmitEmail: "baloglurecep30@hotmail.com",
    formSubmitCc: "baloglurecep@gmail.com",
    social: {
      enabled: false,
      links: [
        { id: "github", label: "GITHUB", url: "https://github.com", enabled: false },
        { id: "linkedin", label: "LINKEDIN", url: "https://linkedin.com", enabled: false },
        { id: "instagram", label: "INSTAGRAM", url: "https://instagram.com", enabled: false }
      ]
    },
    skills: [
      { name: "Arduino / ESP32 Gömülü Yazılım", percentage: 95, color: "var(--cyan)" },
      { name: "Nesnelerin İnterneti (IoT) & MQTT/WebSockets", percentage: 90, color: "var(--purple)" },
      { name: "PCB & Donanım Tasarımı (EasyEDA/Altium)", percentage: 80, color: "var(--green)" },
      { name: "C / C++ / MicroPython", percentage: 85, color: "var(--cyan)" },
      { name: "Full-Stack Web (HTML5/React/NodeJS)", percentage: 80, color: "var(--purple)" },
      { name: "Eğitim Mentörlüğü & STEM Geliştiriciliği", percentage: 95, color: "var(--green)" }
    ],
    site: {
      pageTitle: "Teknomuallim | Eğitimci, Elektronik Geliştirici ve Teknoloji Mentoru",
      pageDescription: "Eğitim ve teknolojiyi harmanlayan, IoT, Arduino, yazılım ve yenilikçi projeler üreten Teknomuallim portfolyo sitesi.",
      nav: {
        brand: "Teknomuallim",
        projects: "Projeler",
        about: "Hakkımda",
        contact: "İletişim"
      },
      hero: {
        badge: "İNOVASYON ATÖLYESİ — CANLI",
        panelCommand: "root@teknomuallim:~# manifesto",
        panelTag: "[ ŞİFRELENMİŞ VERİ ]",
        stat1Label: "Proje",
        stat2Value: "IoT",
        stat2Label: "Uzmanlık",
        stat3Value: "STEM",
        stat3Label: "Mentorlük",
        btnProjects: "PROJELERİ KEŞFET",
        btnAbout: "BENİ TANIN",
        scrollHint: "AŞAĞI KAYDIR"
      },
      projects: {
        label: "Projeler",
        title: "Etkileşimli Ar-Ge Laboratuvarı",
        subtitle: "Geliştirdiğim projelerin çalışma mantığını ve simülasyonunu doğrudan tarayıcınızda deneyimleyin.",
        filterAll: "Hepsi",
        categories: ["IoT & Donanım", "Otomasyon & Yazılım", "Özel Tasarım"],
        btnSimulate: "SİMÜLATÖRÜ BAŞLAT",
        btnDetail: "PROJE DETAYI",
      },
      about: {
        label: "Hakkımda",
        title: "Eğitimden Üretime Uzanan Köprü",
        visionTitle: "Vizyon ve Misyon",
        visionText1: "Yıllarını eğitime vermiş bir öğretmen olarak, masanın sadece anlatan tarafında değil, üreten tarafında da yer alıyorum.",
        visionText2: "Geliştirdiğim her projede öğrencilere de ilham olmayı hedefliyorum. Arduino, IoT teknolojileri ve endüstriyel standarttaki akıllı sistemlerle kurumların operasyonel verimliliğini artırırken, eğitimde STEM yaklaşımlarının somut çıktılar kazanmasını sağlıyorum.",
        educatorTitle: "💡 Eğitimci",
        educatorText: "Geleceği kodlayan nesiller yetiştiriyor, teknoloji ve STEM odaklı projelerde mentorluk yapıyorum.",
        developerTitle: "⚙️ Geliştirici",
        developerText: "Gömülü yazılım, devre kartı tasarımı ve internet kontrollü IoT otomasyon sistemleri üretiyorum.",
        skillsTitle: "Teknoloji & Beceri Envanteri",
        hardwareLabel: "DONANIM KATMANI:",
        hardwareText: "AVR, ESP32 ve ARM Cortex mimarileri üzerinde C++ ve FreeRTOS ile geliştirme."
      },
      contact: {
        label: "İletişim",
        title: "Bağlantı Kurun",
        subtitle: "Projeler, iş birliği veya STEM mentörlüğü için doğrudan iletişime geçebilirsiniz.",
        infoTitle: "Bağlantı Noktaları",
        infoText: "Projelerim hakkında iş birliği yapmak, okullarınız için geliştirmeler talep etmek ya da teknoloji mentörlüğü almak isterseniz benimle doğrudan iletişime geçebilirsiniz.",
        emailLabel: "E-POSTA",
        socialTitle: "Sosyal Ağlar",
        formTitle: "İletişim Formu",
        labelName: "İsim / Kurum Adı",
        labelEmail: "E-posta Adresi",
        labelSubject: "Konu",
        labelMessage: "Mesajınız",
        btnSend: "GÖNDER",
        btnSending: "GÖNDERİLİYOR...",
        subjects: [
          "Genel İletişim",
          "Proje Geliştirme / İş Birliği",
          "STEM / Robotik Eğitim Talebi",
          "Hata Raporu / Öneri"
        ],
        footer: "Bilgiyi aktarmakla kalmıyor, geleceği kodluyor ve üretiyoruz."
      }
    }
  },
  projects: [
    {
      id: "nobetci-cagirma",
      title: "İdari Odalardan Nöbetçi Çağırma Sistemi",
      description: "Okullarda idari odalardaki web arayüzü butonlarına tıklandığında, nöbetçi öğrenci masasındaki alıcı sisteme sinyal gönderen otomasyondur. Nöbetçi masasında bulunan LED ekran, çağıran odayı görsel olarak gösterirken, buzzer modülü farklı ses tonlarıyla işitsel bir uyarı verir. Hem kablolu hem de Wi-Fi üzerinden çalışabilen, okul yönetimini hızlandıran inovatif bir IoT çözümüdür.",
      longDescription: "Bu sistem, okul yöneticilerinin nöbetçi öğrencilere anında ulaşmasını sağlamak amacıyla geliştirilmiştir. İdareciler kendi bilgisayar veya telefon tarayıcılarındaki butonlara tıklar. Sinyal kablosuz ağ (ESP8266) veya RS485 veriyolu üzerinden ana nöbetçi paneline iletilir. Panel, yüksek sesli ve görsel bir uyarı oluşturarak öğrenciyi yönlendirir.",
      technology: ["Arduino Uno", "ESP8266 Wi-Fi", "MAX7219 LED Matrix", "Buzzer", "WebSockets", "CSS Grid"],
      category: "IoT & Donanım",
      simulatorType: "summoner",
      image: "",
      galleryEnabled: true,
      featuresEnabled: true,
      simulatorViewMode: "interactive",
      customVideoUrl: "",
      customImageUrl: "",
      images: [
        "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?q=80&w=800",
        "https://images.unsplash.com/photo-1608564697071-ddf911d81370?q=80&w=800",
        "https://images.unsplash.com/photo-1517059224940-d4af9eec41b7?q=80&w=800"
      ],
      features: [
        { icon: "📡", text: "Wi-Fi (ESP8266) tabanlı kablosuz haberleşme veya alternatif olarak RS485 endüstriyel kablolu hat altyapısı." },
        { icon: "🔊", text: "Çağıran idari birimin önem derecesine göre farklı frekansta ses üreten aktif buzzer uyarı ünitesi." },
        { icon: "📟", text: "MAX7219 8x8 LED matris ekran modülü ile çağıran odanın adının (MUDUR, M.YRD vb.) kayan yazı ile gösterimi." },
        { icon: "💻", text: "Tüm idari odalar için özel yetkilendirilmiş, responsive tasarıma sahip web tabanlı çağırma kontrol arayüzü." }
      ]
    },
    {
      id: "led-skorboard",
      title: "Halı Sahalar için LED Skorboard",
      description: "Kablosuz RF kumanda veya mobil uygulama üzerinden kontrol edilebilen, skorları, maç süresini ve takım isimlerini parlak LED ekranlarda gösteren otomasyon sistemidir. Dış mekan koşullarına dayanıklı gövdesi ve yüksek görüş açısına sahip P10 panelleriyle profesyonel bir deneyim sunar.",
      longDescription: "Halı sahaların skor ve zaman yönetimini kolaylaştırmak amacıyla tasarlanmıştır. Mobil uygulama üzerinden Bluetooth veya Wi-Fi yardımıyla takımların isimleri, maç süresi girilebilir. Hakem kolundaki RF kumanda ile gol atıldığında skorlar anında güncellenir. Süre bittiğinde siren çalar.",
      technology: ["ESP32", "P10 LED Panel", "RF Alıcı/Verici", "Android Geliştirme", "Bluetooth BLE"],
      category: "IoT & Donanım",
      simulatorType: "scoreboard",
      image: "",
      galleryEnabled: true,
      featuresEnabled: true,
      simulatorViewMode: "interactive",
      customVideoUrl: "",
      customImageUrl: "",
      images: [
        "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?q=80&w=800",
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800",
        "https://images.unsplash.com/photo-1551645121-d1034da75057?q=80&w=800"
      ],
      features: [
        { icon: "⚽", text: "Güneş ışığı altında dahi yüksek görünürlük sunan dış mekan P10 kırmızı/RGB LED matris panelleri." },
        { icon: "📟", text: "Çift ekranlı mimari: Skorboard paneline ek olarak; tarih-saat, sıcaklık-nem ve 70 harfe kadar kayan yazı gösteren bilgi ekranı." },
        { icon: "⏱️", text: "Sıfırdan başlayarak ileriye doğru hassas bir şekilde sayan yerleşik kronometre sayacı." },
        { icon: "📣", text: "Gol atıldığında tetiklenen 'GOOOL!' animasyonu, flaş efektleri ve Web Audio düdük sireni." }
      ]
    },
    {
      id: "boy-kilo-olcer",
      title: "Boy Kilo Ölçer Otomasyon Sistemi",
      description: "Okullar, sağlık kuruluşları ve spor merkezleri için temassız ultrasonik mesafe sensörü ve hassas yük hücreleri (loadcell) kullanan boy kilo ölçüm otomasyonudur. Sonuçları sesli olarak bildirebilir, dahili TFT ekranında gösterebilir ve yerel ağdaki bir veritabanına kaydedebilir.",
      longDescription: "Özellikle okullarda sene başı taramalarını kolaylaştırmak için tasarlanmış akıllı istasyondur. HC-SR04 ultrasonik sensör ile kafadan mesafe okunur, HX711 amplifikatörü ile ağırlık tartılır. Veriler Arduino Mega tarafından işlenerek Nextion HMI ekrana aktarılır ve veri tabanına işlenir.",
      technology: ["Arduino Mega", "HC-SR04 Ultrasonik", "HX711 Loadcell", "Nextion TFT", "C++ Gömülü Yazılım"],
      category: "Otomasyon & Yazılım",
      simulatorType: "scale",
      image: "",
      galleryEnabled: true,
      featuresEnabled: true,
      simulatorViewMode: "interactive",
      customVideoUrl: "",
      customImageUrl: "",
      images: [
        "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800",
        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800",
        "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?q=80&w=800"
      ],
      features: [
        { icon: "⚡", text: "NEMA 17 yüksek torklu step motor ve kararlı dikey linear ray kılavuzlu otomatik hareket mekanizması." },
        { icon: "🔍", text: "Kafaya temas ettiği anda algılayan hassas araba ve limit kesici sensörler ile milimetrik boy tayini." },
        { icon: "⚖️", text: "HX711 24-bit yüksek hassasiyetli ADC ve 150kg kapasiteli çelik yük hücresi (loadcell) baskül platformu." },
        { icon: "🗣️", text: "Ölçüm tamamlandığında devreye giren Nextion TFT akıllı ekran görsel bildirimi ve Türkçe ses sentezleyici raporlama." }
      ]
    },
    {
      id: "zil-sistemi",
      title: "Okul ve Fabrika Akıllı Zil Sistemi",
      description: "Haftalık zil programlarını internet üzerinden otomatik senkronize eden, ders, teneffüs ve öğretmen zillerini farklı melodilerle çalan, acil durum durumlarında anons modülü olarak çalışan programlanabilir akıllı zil sistemidir.",
      longDescription: "Geleneksel mekanik zil saatlerinin yerine geçen, internet bağlantılı (NTP) çalışan akıllı cihazdır. DS3231 hassas gerçek zamanlı saat modülü elektrik kesintilerinde bile zamanı korur. DFPlayer Mini ses modülü sayesinde istenen mp3 melodisi okul amfisine aktarılır.",
      technology: ["Raspberry Pi Pico", "DS3231 RTC", "DFPlayer Mini", "Röle Kartı", "MicroPython"],
      category: "Otomasyon & Yazılım",
      simulatorType: "bell",
      image: "",
      galleryEnabled: true,
      featuresEnabled: true,
      simulatorViewMode: "interactive",
      customVideoUrl: "",
      customImageUrl: "",
      images: [
        "https://images.unsplash.com/photo-1563770660941-20978e870e26?q=80&w=800",
        "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800",
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800"
      ],
      features: [
        { icon: "⏰", text: "DS3231 entegresi ile elektrik kesilse dahi zaman doğruluğunu milisaniye seviyesinde koruyan gerçek zamanlı saat." },
        { icon: "🎵", text: "DFPlayer Mini MP3 dekoderi ve amfi kontrol rölesi ile gürültüsüz, temiz melodi aktarımı." },
        { icon: "🌐", text: "Wi-Fi üzerinden NTP sunucularına bağlanarak haftalık ders programını otomatik güncelleyen yazılım." },
        { icon: "🚨", text: "Yangın veya deprem sensörleriyle haberleşerek otomatik acil durum sireni ve ses kaydı yayını başlatma." }
      ]
    },
    {
      id: "ozel-yazilimlar",
      title: "Özel İstek Yazılımlar ve Projeler",
      description: "Eğitim kurumlarının veya endüstriyel tesislerin ihtiyaç duyduğu özel gömülü yazılımlar, veri toplama (SCADA/Dashboard) yazılımları, PCB devre tasarımı ve özelleştirilmiş robotik eğitim setlerinin tasarımı.",
      longDescription: "Standart ürünlerin yetersiz kaldığı durumlarda, baştan sona Ar-Ge süreci yürütülerek elektronik kart tasarımı (EasyEDA/Altium), prototip üretimi ve 3D gövde tasarımı yapılarak anahtar teslim projeler sunulmaktadır.",
      technology: ["PCB Tasarım", "Python", "MQTT Protokolü", "Node-RED", "C++", "SolidWorks"],
      category: "Özel Tasarım",
      simulatorType: "custom",
      image: "",
      galleryEnabled: true,
      featuresEnabled: true,
      simulatorViewMode: "interactive",
      customVideoUrl: "",
      customImageUrl: "",
      images: [
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800",
        "https://images.unsplash.com/photo-1631553127988-3486c67efbc8?q=80&w=800",
        "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=800"
      ],
      features: [
        { icon: "📐", text: "İhtiyaca özel çok katmanlı PCB şematik çizimi ve baskı devre kartı tasarımı (Altium Designer/EasyEDA)." },
        { icon: "💻", text: "C++ gömülü kodlama, FreeRTOS entegrasyonu ve endüstriyel standartta güvenli mikrodenetleyici algoritmaları." },
        { icon: "📊", text: "MQTT veya WebSockets protokolleri ile yerel sensör verilerinin bulut SCADA ve IoT gösterge panellerine akışı." },
        { icon: "🛠️", text: "Katı modelleme, endüstriyel kutu tasarımı (3D baskı/CNC freze) ve montaj dahil anahtar teslim teslimat." }
      ]
    }
  ]
};

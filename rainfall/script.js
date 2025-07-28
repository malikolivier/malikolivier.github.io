class JapanRainfallApp {
    constructor() {
        this.regions = [
            // 福島 Prefecture locations
            { name: '福島', lat: 37.7503, lon: 140.4676, prefecture: '福島' },
            { name: '郡山', lat: 37.4000, lon: 140.3833, prefecture: '福島' },
            { name: 'いわき', lat: 37.0569, lon: 140.8868, prefecture: '福島' },
            { name: '白河', lat: 37.1253, lon: 140.2104, prefecture: '福島' },
            { name: '喜多方', lat: 37.6503, lon: 139.8750, prefecture: '福島' },
            { name: '米沢', lat: 37.9122, lon: 140.1158, prefecture: '山形' },
            { name: '西川町', lat: 38.4167, lon: 140.0167, prefecture: '山形' },
            { name: '檜枝岐', lat: 37.0000, lon: 139.2833, prefecture: '福島' },
            { name: '田島 (南会津)', lat: 37.2000, lon: 139.8667, prefecture: '福島' },
            { name: '下郷', lat: 37.2000, lon: 139.9333, prefecture: '福島' },
            { name: '天栄', lat: 37.3000, lon: 140.0833, prefecture: '福島' },
            { name: '魚沼', lat: 37.4500, lon: 139.7167, prefecture: '新潟' },
            { name: '阿賀', lat: 37.8333, lon: 139.4667, prefecture: '新潟' },
            { name: '日光', lat: 36.7583, lon: 139.6167, prefecture: '栃木' },
            { name: '中禅寺湖', lat: 36.7333, lon: 139.4833, prefecture: '栃木' },
            { name: '塩原温泉', lat: 36.9167, lon: 139.8667, prefecture: '栃木' },
            { name: '川上村', lat: 35.8667, lon: 138.5167, prefecture: '長野' },
            { name: '只見', lat: 37.3833, lon: 139.3333, prefecture: '福島' },
            { name: '猪苗代', lat: 37.5500, lon: 140.1167, prefecture: '福島' },
            { name: '相馬', lat: 37.7972, lon: 140.9222, prefecture: '福島' },
            { name: '伊達', lat: 37.8167, lon: 140.5667, prefecture: '福島' },
            { name: '小野', lat: 37.3000, lon: 140.6167, prefecture: '福島' },
            { name: '矢際', lat: 37.4333, lon: 140.2833, prefecture: '福島' },
            { name: '葛尾', lat: 37.4667, lon: 140.7667, prefecture: '福島' },
            { name: '昭和村', lat: 37.3333, lon: 139.6833, prefecture: '福島' },
            { name: '古殿', lat: 37.0333, lon: 140.5500, prefecture: '福島' },
            
            // Tohoku region major cities
            { name: '仙台', lat: 38.2682, lon: 140.8694, prefecture: '宮城' },
            { name: '青森', lat: 40.8244, lon: 140.7400, prefecture: '青森' },
            { name: '八戸', lat: 40.5126, lon: 141.4883, prefecture: '青森' },
            { name: '弘前', lat: 40.6044, lon: 140.4639, prefecture: '青森' },
            { name: '盛岡', lat: 39.7036, lon: 141.1527, prefecture: '岩手' },
            { name: '一関', lat: 38.9342, lon: 141.1289, prefecture: '岩手' },
            { name: '奥州', lat: 39.1433, lon: 141.1347, prefecture: '岩手' },
            { name: '石巻', lat: 38.4339, lon: 141.3025, prefecture: '宮城' },
            { name: '大崎', lat: 38.5803, lon: 140.9542, prefecture: '宮城' },
            { name: '登米', lat: 38.6911, lon: 141.2117, prefecture: '宮城' },
            { name: '秋田', lat: 39.7186, lon: 140.1023, prefecture: '秋田' },
            { name: '横手', lat: 39.3092, lon: 140.5453, prefecture: '秋田' },
            { name: '大館', lat: 40.2728, lon: 140.5664, prefecture: '秋田' },
            { name: '山形', lat: 38.2404, lon: 140.3633, prefecture: '山形' },
            { name: '鶴岡', lat: 38.7281, lon: 139.8256, prefecture: '山形' },
            { name: '酒田', lat: 38.9142, lon: 139.8311, prefecture: '山形' },
            
            // Other major Japanese cities for context
            { name: '東京', lat: 35.6762, lon: 139.6503, prefecture: '東京都' },
            { name: '大阪', lat: 34.6937, lon: 135.5023, prefecture: '大阪府' },
            { name: '京都', lat: 35.0116, lon: 135.7681, prefecture: '京都府' },
            { name: '新潟', lat: 37.9026, lon: 139.0233, prefecture: '新潟' },
            { name: '札幌', lat: 43.0642, lon: 141.3469, prefecture: '北海道' }
        ];
        
        this.map = null;
        this.markers = [];
        this.rainfallData = [];
        this.currentView = 'map';
        
        this.init();
    }

    init() {
        this.initMap();
        this.bindEvents();
        this.loadRainfallData();
    }

    initMap() {
        // Center on 福島 Prefecture with appropriate zoom
        this.map = L.map('map').setView([37.4, 140.0], 8);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);
    }

    bindEvents() {
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.loadRainfallData();
        });

        document.getElementById('mapViewBtn').addEventListener('click', () => {
            this.switchView('map');
        });

        document.getElementById('gridViewBtn').addEventListener('click', () => {
            this.switchView('grid');
        });
    }

    switchView(view) {
        this.currentView = view;
        
        document.getElementById('mapViewBtn').classList.toggle('active', view === 'map');
        document.getElementById('gridViewBtn').classList.toggle('active', view === 'grid');
        
        document.getElementById('mapContainer').style.display = view === 'map' ? 'block' : 'none';
        document.getElementById('regionsGrid').style.display = view === 'grid' ? 'grid' : 'none';
        
        if (view === 'map' && this.map) {
            setTimeout(() => this.map.invalidateSize(), 100);
        }
    }

    showLoading() {
        document.getElementById('loading').style.display = 'block';
        document.getElementById('error').style.display = 'none';
        document.getElementById('mapContainer').style.display = 'none';
        document.getElementById('regionsGrid').style.display = 'none';
    }

    hideLoading() {
        document.getElementById('loading').style.display = 'none';
    }

    showError() {
        document.getElementById('error').style.display = 'block';
        document.getElementById('mapContainer').style.display = 'none';
        document.getElementById('regionsGrid').style.display = 'none';
    }

    showResults() {
        document.getElementById('error').style.display = 'none';
        this.switchView(this.currentView);
    }

    async fetchRainfallData(lat, lon) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 7);

        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];

        const url = `https://api.open-meteo.com/v1/jma?latitude=${lat}&longitude=${lon}&daily=precipitation_sum&start_date=${startDateStr}&end_date=${endDateStr}&timezone=Asia/Tokyo`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching rainfall data:', error);
            throw error;
        }
    }

    async loadRainfallData() {
        this.showLoading();
        
        try {
            const rainfallPromises = this.regions.map(async (region) => {
                const data = await this.fetchRainfallData(region.lat, region.lon);
                return {
                    region: region,
                    data: data
                };
            });

            const results = await Promise.all(rainfallPromises);
            this.rainfallData = results;
            this.displayResults(results);
            this.displayMapMarkers(results);
            this.updateLastUpdated();
            
        } catch (error) {
            console.error('Failed to load rainfall data:', error);
            this.showError();
        } finally {
            this.hideLoading();
        }
    }

    displayResults(results) {
        const regionsGrid = document.getElementById('regionsGrid');
        regionsGrid.innerHTML = '';

        results.forEach(({ region, data }) => {
            const card = this.createRegionCard(region, data);
            regionsGrid.appendChild(card);
        });

        this.showResults();
    }

    displayMapMarkers(results) {
        this.markers.forEach(marker => this.map.removeLayer(marker));
        this.markers = [];

        results.forEach(({ region, data }) => {
            const totalRainfall = this.calculateTotalRainfall(data.daily.precipitation_sum);
            const markerClass = this.getRainfallMarkerClass(totalRainfall);
            
            const markerElement = this.createMarkerElement(totalRainfall, markerClass);
            
            const marker = L.marker([region.lat, region.lon], {
                icon: L.divIcon({
                    html: markerElement,
                    iconSize: [40, 40],
                    iconAnchor: [20, 20],
                    className: 'custom-marker'
                })
            });

            const popupContent = this.createPopupContent(region, data);
            marker.bindPopup(popupContent);
            
            marker.addTo(this.map);
            this.markers.push(marker);
        });
    }

    createMarkerElement(totalRainfall, markerClass) {
        return `<div class="rainfall-marker ${markerClass}" style="width: 40px; height: 40px;">
            ${totalRainfall.toFixed(0)}
        </div>`;
    }

    getRainfallMarkerClass(rainfall) {
        if (rainfall >= 50) return 'high';
        if (rainfall >= 20) return 'medium';
        if (rainfall > 0) return 'low';
        return 'none';
    }

    createPopupContent(region, data) {
        const totalRainfall = this.calculateTotalRainfall(data.daily.precipitation_sum);
        const dailyDataHTML = this.createDailyDataHTML(data.daily);
        
        return `
            <div style="font-family: Arial, sans-serif;">
                <h3 style="margin: 0 0 10px 0; color: #2d3436;">${region.name}</h3>
                <p style="margin: 0 0 10px 0; color: #636e72;">${region.prefecture === '東京都' || region.prefecture === '北海道' || region.prefecture === '大阪府' || region.prefecture === '京都府' ? region.prefecture : region.prefecture + '県'}</p>
                <div style="font-size: 18px; font-weight: bold; color: #0984e3; margin-bottom: 15px;">
                    合計: ${totalRainfall.toFixed(1)} mm
                </div>
                <div style="max-height: 200px; overflow-y: auto;">
                    ${dailyDataHTML}
                </div>
            </div>
        `;
    }

    createRegionCard(region, data) {
        const card = document.createElement('div');
        card.className = 'region-card';

        const totalRainfall = this.calculateTotalRainfall(data.daily.precipitation_sum);
        
        card.innerHTML = `
            <div class="region-header">
                <div class="region-name">${region.name} (${region.prefecture === '東京都' || region.prefecture === '北海道' || region.prefecture === '大阪府' || region.prefecture === '京都府' ? region.prefecture : region.prefecture + '県'})</div>
                <div class="total-rainfall">
                    ${totalRainfall.toFixed(1)}
                    <span class="rainfall-unit">mm</span>
                </div>
            </div>
            <div class="daily-data">
                ${this.createDailyDataHTML(data.daily)}
            </div>
        `;

        return card;
    }

    createDailyDataHTML(dailyData) {
        const dates = dailyData.time;
        const precipitation = dailyData.precipitation_sum;
        
        return dates.map((date, index) => {
            const rainfall = precipitation[index] || 0;
            const dayClass = this.getRainfallClass(rainfall);
            const formattedDate = new Date(date).toLocaleDateString('ja-JP', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
            });
            
            return `
                <div class="day-item ${dayClass}">
                    <span class="day-date">${formattedDate}</span>
                    <span class="day-rainfall">${rainfall.toFixed(1)} mm</span>
                </div>
            `;
        }).join('');
    }

    getRainfallClass(rainfall) {
        if (rainfall >= 20) return 'high-rain';
        if (rainfall >= 5) return 'medium-rain';
        if (rainfall > 0) return 'low-rain';
        return '';
    }

    calculateTotalRainfall(precipitationArray) {
        return precipitationArray.reduce((total, daily) => total + (daily || 0), 0);
    }

    updateLastUpdated() {
        const now = new Date();
        const timeString = now.toLocaleString('ja-JP', {
            timeZone: 'Asia/Tokyo',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short'
        });
        
        document.getElementById('lastUpdated').textContent = timeString;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new JapanRainfallApp();
});
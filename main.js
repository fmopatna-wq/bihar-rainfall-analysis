// Rainfall Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    
    // Load data
    let rainfallData = [];
    let summaryStats = {};
    
    // Initialize dashboard
    async function initDashboard() {
        try {
            // Load data files
            const [rainfallResponse, summaryResponse] = await Promise.all([
                fetch('rainfall_data.json'),
                fetch('summary_stats.json')
            ]);
            
            rainfallData = await rainfallResponse.json();
            summaryStats = await summaryResponse.json();
            
            // Initialize visualizations
            initializeAnimations();
            initializeCharts();
            setupEventListeners();
            
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }
    
    // Initialize animations
    function initializeAnimations() {
        // Hero section animations
        anime.timeline({
            easing: 'easeOutExpo',
            duration: 1000
        })
        .add({
            targets: '#hero-title',
            opacity: [0, 1],
            translateY: [50, 0],
            delay: 500
        })
        .add({
            targets: '#hero-subtitle',
            opacity: [0, 1],
            translateY: [30, 0],
            delay: 200
        }, '-=700')
        .add({
            targets: '#hero-buttons',
            opacity: [0, 1],
            translateY: [20, 0],
            delay: 300
        }, '-=500');
        
        // Scroll animations for cards
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    anime({
                        targets: entry.target,
                        opacity: [0, 1],
                        translateY: [30, 0],
                        duration: 800,
                        easing: 'easeOutQuart',
                        delay: anime.stagger(100)
                    });
                }
            });
        }, observerOptions);
        
        // Observe all chart containers and stat cards
        document.querySelectorAll('.chart-container, .stat-card').forEach(el => {
            el.style.opacity = '0';
            observer.observe(el);
        });
    }
    
    // Initialize all charts
    function initializeCharts() {
        createHeatmapChart();
        createTop10Chart();
        createYearlyTrendChart();
        createDistrictTrendChart();
        updateStatistics();
    }
    
    // Update statistics
    function updateStatistics() {
        document.getElementById('total-districts').textContent = summaryStats.total_districts;
        document.getElementById('avg-rainfall').textContent = summaryStats.avg_rainy_days_overall;
        document.getElementById('max-district').textContent = summaryStats.max_rainfall_district.district;
        document.getElementById('min-district').textContent = summaryStats.min_rainfall_district.district;
    }
    
    // Create heatmap chart
    function createHeatmapChart() {
        const chart = echarts.init(document.getElementById('heatmap-chart'));
        
        // Prepare data for heatmap
        const districts = rainfallData.map(d => d.district);
        const years = ['2021', '2022', '2023', '2024', '2025'];
        const heatmapData = [];
        
        rainfallData.forEach((district, districtIndex) => {
            years.forEach((year, yearIndex) => {
                heatmapData.push([
                    yearIndex,
                    districtIndex,
                    district[`rainy_days_${year}`]
                ]);
            });
        });
        
        const option = {
            tooltip: {
                position: 'top',
                formatter: function(params) {
                    return `${districts[params.data[1]]}<br/>${years[params.data[0]]}: ${params.data[2]} वर्षा दिवस`;
                }
            },
            grid: {
                height: '70%',
                top: '10%'
            },
            xAxis: {
                type: 'category',
                data: years,
                splitArea: {
                    show: true
                },
                axisLabel: {
                    fontSize: 12
                }
            },
            yAxis: {
                type: 'category',
                data: districts,
                splitArea: {
                    show: true
                },
                axisLabel: {
                    fontSize: 10
                }
            },
            visualMap: {
                min: 30,
                max: 180,
                calculable: true,
                orient: 'horizontal',
                left: 'center',
                bottom: '5%',
                inRange: {
                    color: ['#e8f0f391', '#3b3dc7bb', '#f50404ff']
                }
            },
            series: [{
                name: 'वर्षा दिवस',
                type: 'heatmap',
                data: heatmapData,
                label: {
                    show: false
                },
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }]
        };
        
        chart.setOption(option);
        
        // Store chart instance for updates
        window.heatmapChart = chart;
        
        // Handle window resize
        window.addEventListener('resize', () => {
            chart.resize();
        });
    }
    
    // Create top 10 districts chart
    function createTop10Chart() {
        const chart = echarts.init(document.getElementById('top10-chart'));
        
        const top10Data = summaryStats.top_10_districts;
        const districts = top10Data.map(d => d.district);
        const values = top10Data.map(d => d.total_rainy_days);
        
        const option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                formatter: function(params) {
                    return `${params[0].name}<br/>कुल वर्षा दिवस: ${params[0].value}`;
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'value',
                axisLabel: {
                    formatter: '{value} दिन'
                }
            },
            yAxis: {
                type: 'category',
                data: districts,
                axisLabel: {
                    fontSize: 11
                }
            },
            series: [{
                name: 'कुल वर्षा दिवस',
                type: 'bar',
                data: values,
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                        { offset: 0, color: '#4a90a4' },
                        { offset: 1, color: '#1e4d4b' }
                    ])
                },
                emphasis: {
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                            { offset: 0, color: '#5ba3b8' },
                            { offset: 1, color: '#2e5d5b' }
                        ])
                    }
                },
                label: {
                    show: true,
                    position: 'right',
                    formatter: '{c} दिन',
                    fontSize: 11
                }
            }]
        };
        
        chart.setOption(option);
        
        window.addEventListener('resize', () => {
            chart.resize();
        });
    }
    
    // Create yearly trend chart
    function createYearlyTrendChart() {
        const chart = echarts.init(document.getElementById('yearly-trend-chart'));
        
        const yearlyData = summaryStats.yearly_totals;
        const years = Object.keys(yearlyData);
        const values = Object.values(yearlyData);
        
        const option = {
            tooltip: {
                trigger: 'axis',
                formatter: function(params) {
                    return `${params[0].name}<br/>कुल वर्षा दिवस: ${params[0].value}`;
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: years,
                boundaryGap: false
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    formatter: '{value} दिन'
                }
            },
            series: [{
                name: 'कुल वर्षा दिवस',
                type: 'line',
                data: values,
                smooth: true,
                itemStyle: {
                    color: '#1e4d4b'
                },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(30, 77, 75, 0.3)' },
                        { offset: 1, color: 'rgba(30, 77, 75, 0.1)' }
                    ])
                },
                lineStyle: {
                    width: 3
                },
                symbol: 'circle',
                symbolSize: 8,
                label: {
                    show: true,
                    position: 'top',
                    formatter: '{c}',
                    fontSize: 11
                }
            }]
        };
        
        chart.setOption(option);
        
        window.addEventListener('resize', () => {
            chart.resize();
        });
    }
    
    // Create district trend chart (showing top 5 districts)
    function createDistrictTrendChart() {
        const chart = echarts.init(document.getElementById('district-trend-chart'));
        
        const top5Districts = summaryStats.top_10_districts.slice(0, 5);
        const years = ['2021', '2022', '2023', '2024', '2025'];
        
        const series = top5Districts.map((district, index) => {
            const colors = ['#1e4d4b', '#4a90a4', '#8b6f47', '#5ba3b8', '#a0845c'];
            return {
                name: district.district,
                type: 'line',
                data: years.map(year => district[`rainy_days_${year}`]),
                smooth: true,
                itemStyle: {
                    color: colors[index]
                },
                lineStyle: {
                    width: 2
                },
                symbol: 'circle',
                symbolSize: 6
            };
        });
        
        const option = {
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: top5Districts.map(d => d.district),
                bottom: 0,
                textStyle: {
                    fontSize: 11
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: years,
                boundaryGap: false
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    formatter: '{value} दिन'
                }
            },
            series: series
        };
        
        chart.setOption(option);
        
        window.addEventListener('resize', () => {
            chart.resize();
        });
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Year selector for heatmap
        const yearSelector = document.getElementById('year-selector');
        if (yearSelector) {
            yearSelector.addEventListener('change', function() {
                updateHeatmapByYear(this.value);
            });
        }
        
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
    
    // Update heatmap by selected year
    function updateHeatmapByYear(year) {
        if (!window.heatmapChart || !rainfallData.length) return;
        
        const districts = rainfallData.map(d => d.district);
        const years = ['2021', '2022', '2023', '2024', '2025'];
        
        let heatmapData = [];
        
        if (year === 'total') {
            // Show total across all years
            rainfallData.forEach((district, districtIndex) => {
                heatmapData.push([0, districtIndex, district.total_rainy_days]);
            });
            
            const option = {
                xAxis: {
                    data: ['कुल (2021-2025)']
                },
                visualMap: {
                    min: 250,
                    max: 550
                },
                series: [{
                    data: heatmapData
                }]
            };
            
            window.heatmapChart.setOption(option);
        } else {
            // Show data for specific year
            rainfallData.forEach((district, districtIndex) => {
                heatmapData.push([0, districtIndex, district[`rainy_days_${year}`]]);
            });
            
            const option = {
                xAxis: {
                    data: [year]
                },
                visualMap: {
                    min: 30,
                    max: 180
                },
                series: [{
                    data: heatmapData
                }]
            };
            
            window.heatmapChart.setOption(option);
        }
    }
    
    // Initialize dashboard when page loads
    initDashboard();
    
    // Handle window resize for all charts
    window.addEventListener('resize', function() {
        // Resize all charts
        const charts = document.querySelectorAll('[id$="-chart"]');
        charts.forEach(chartElement => {
            const chartInstance = echarts.getInstanceByDom(chartElement);
            if (chartInstance) {
                chartInstance.resize();
            }
        });
    });
    
    // Add scroll-based animations
    function addScrollAnimations() {
        const elements = document.querySelectorAll('.chart-container, .stat-card');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        });
        
        elements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }
    
    // Call scroll animations
    addScrollAnimations();
});

// Utility functions
function formatNumber(num) {
    return new Intl.NumberFormat('hi-IN').format(num);
}

function getRainfallCategory(days) {
    if (days >= 400) return 'अत्यधिक';
    if (days >= 350) return 'उच्च';
    if (days >= 300) return 'मध्यम';
    return 'कम';
}
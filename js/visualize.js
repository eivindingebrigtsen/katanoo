window.visualize = function(data){
  var agents  = {},
      windows = {},
      langs   = {},
      sizes   = {
        0: 0,
        640: 0,
        800: 0,
        1024: 0,
        1280: 0,
        1440: 0,
        1900: 0,
        2400: 0,
        3600: 0
      },      
      os      = {},
      time    = {},
      info    = {}, 
      lang,
      item,
      visits = 0, 
      t, 
      d, 
      yy, 
      dd, 
      mm, 
      hh, 
      min, 
      timeid, 
      a, 
      b, 
      ev,
      ev_arr,
      low = 9999999999999,  // High times
      high = 0,             // Low times
      days,
      day = 86400000,
      l = 0,
      c_l,
      session_time = [],
      months = ['jan', 'feb', 'mar', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des'];
      
      $('h1').text('Calculating data');
      d = new Date();

      for (a in data){
        item = data[a];
        if(typeof item !== 'object' || a == "0"){ continue; }
        visits++;
        // Date specifics
        t = parseFloat(a.substr(0,13));
        low = (low > t ? t-day :  low);
        high = (high < t ? t : high);
        d.setTime(t);
        yy = d.getFullYear();
        mm = d.getMonth()+1;
        dd = d.getDate();
        hh = d.getHours();
        min = d.getMinutes();
        timeid = dd+'-'+ mm +'-'+yy;
    
        if(timeid in time){
          time[timeid].visits++;
          time[timeid].time.push({hour: hh, min: min})
        }else{
          time[timeid] = {
            visits : 1,
            time: [{hour: hh, min: min}],
            clicks: 0        
          };
        }
        lang = (item.language ? item.language.toLowerCase(): undefined);
        if(lang in langs){
          langs[lang]++;
        }else{
          langs[lang] = 1;
        }
        if(item.screen){
          var size = item.screen.split(' ');
          size = parseFloat(size[0]);
          for(var z in sizes){
            if(size<z){               
              sizes[z]++;
              break;
            }
          }
        }
        
        info = checkBrowser(data[a].agent);
        if(info.os in os){
          os[info.os]++;
        }else{
          os[info.os] = 1;
        }
        if(info.id+' '+info.os in agents){
          agents[info.id+' '+info.os].num++;
        }else{
          agents[info.id+' '+info.os] = info;
          agents[info.id+' '+info.os].num = 1;
        }   
        l = 0; 
        if("events" in item){
          for(b in item['events']){
            ev = item['events'][b];
            ev_arr = ev.split(' ');
            cl = parseFloat(b.substr(3));
            if(l<cl){
              l = cl;
            }
            if(ev_arr[0]==='cl'){
              time[timeid].clicks++;
            }        
          }
         session_time.push(l);
        }    
      }
      
      
  var totaltime = 0;
  var averagetime = 0;
  for(var t in session_time){
    totaltime += session_time[t];    
  }
  averagetime = totaltime/session_time.length;
  // Getting the amount of days in data
  days = Math.round((high-low)/day);
  
  var i = 1,
      timeseries = [{name: 'visits', data: []}, {name: 'clicks', data: []}],
      visits, clicks, daylabels = [];
  do{
    d.setTime((low+(i*day)));
    yy = d.getFullYear();
    mm = d.getMonth()+1;
    dd = d.getDate();
    timeid = dd+'-'+ mm +'-'+yy;
    clicks = 0;
    visits = 0;
    daylabels.push(dd+'. '+months[mm-1]+ ' '+ yy)
    if(time[timeid] !== undefined){
      clicks = time[timeid].clicks;
      visits = time[timeid].visits;
    }
    timeseries[1].data.push(clicks);
    timeseries[0].data.push(visits);
    i++;
  }while(i<=days);

  var timechart = new Highcharts.Chart({
      chart: {
         renderTo: 'timeline',
         defaultSeriesType: 'spline',
         margin: [0,0,50,30]
      },
      credits: {enabled: false},
      legend: {enabled: false},
      title: {text: 'Visits / Clicks'},
      xAxis: {categories: daylabels, labels:{enabled: false}},
      yAxis: {min: 0, labels: {formatter: function(){return this.value;}}},
      tooltip:{
        shared: true,
        crosshairs: true, 
        formatter: function(){
          var str = '';
          str += this.points[0].x + '<br/>';
          for (var a in this.points){
            str += this.points[a].series.name + ' : '+ this.points[a].y + '<br/>';
          }
          return str;
      }},
     series: timeseries
   });
  

  var osseries = [];
  for (var c in os){
    osseries.push([c, os[c]]);
  }
  var oschart = new Highcharts.Chart({
      chart: {
         renderTo: 'os',
         defaultSeriesType: 'pie',
         margin: [70,0,20,30]
      },
      credits: {enabled: false},
      legend: {enabled: false},
      title: {text: 'Operating Systems'},
      xAxis: {labels: {enabled: false}},
      yAxis: {min: 0, labels: {formatter: function(){return this.value;}}},
      tooltip:{formatter: function(){
          return this.point.name + ': '+this.y;
      }},
     series: [{ 
       name: 'Operating Systems',
       data: osseries}]
   });
  var agentseries = [];
  for (var d in agents){
    agentseries.push([d, agents[d].num]);
  }

  var agentchart = new Highcharts.Chart({
      chart: {
         renderTo: 'browsers',
         defaultSeriesType: 'pie',
         margin: [70,0,20,30]
      },
      credits: {enabled: false},
      legend: {enabled: false},
      title: {text: 'Browsers'},
      xAxis: {labels: {enabled: false}},
      yAxis: {min: 0, labels: {formatter: function(){return this.value;}}},
      tooltip:{formatter: function(){
          return this.point.name + ': '+this.y;
      }},
     series: [{
       name: 'Browsers',
       data: agentseries
     }] 
   });

   var langseries = [];
   for (var e in langs){
     langseries.push([e,langs[e]]);
   }
   var agentchart = new Highcharts.Chart({
      chart: {
         renderTo: 'langs',
         defaultSeriesType: 'pie',
         margin: [70,0,20,30]
      },
      credits: {enabled: false},
      legend: {enabled: false},
      title: {text: 'Languages'},
      xAxis: {labels: {enabled: false}},
      yAxis: {min: 0, labels: {formatter: function(){return this.value;}}},
      tooltip:{formatter: function(){
          return this.point.name + ': '+this.y;
      }},
     series: [{
        name: 'Languages',
        data: langseries
      }]
   });
   var sizeseries = [];
   for (var e in sizes){
     if(sizes[e] !== 0){
       sizeseries.push(['< '+e+'px',sizes[e]]);
     }
   }
   var sizechart = new Highcharts.Chart({
      chart: {
         renderTo: 'screens',
         defaultSeriesType: 'pie',
         margin: [70,0,20,30]
      },
      credits: {enabled: false},
      legend: {enabled: false},
      title: {text: 'Screen Sizes'},
      xAxis: {labels: {enabled: false}},
      yAxis: {min: 0, labels: {formatter: function(){return this.value;}}},
      tooltip:{formatter: function(){
          return this.point.name + ': '+this.y;
      }},
     series: [{
        name: 'Screen Sizes',
        data: sizeseries
      }]
   });
   
   // var hart = new Highcharts.Chart({
   //       chart: {
   //          renderTo: 'combined',
   //          defaultSeriesType: 'pie',
   //          margin: [70,0,20,30]
   //       },
   //       credits: {enabled: false},
   //       legend: {enabled: false},
   //       title: {text: 'Users'},
   //       xAxis: {labels: {enabled: false}},
   //       yAxis: {min: 0, labels: {formatter: function(){return this.value;}}},
   //       tooltip:{formatter: function(){
   //           return this.point.name + ': '+this.y;
   //       }},
   //      series: [{
   //         name: 'Browsers',
   //         innerSize: '45%',
   //         data: agentseries
   //       },{
   //         name: 'Operating Systems',
   //         innerSize: '20%',
   //         size: '45%',
   //         data: osseries
   //       }
   //       ]
   //    });
   
     $('h1').text('Statistics '+data.URI);

};


  var checkBrowser = function(agentString){   
    var searchString = function (data) {
      for (var i=0;i<data.length;i++)  {
        var dataString = data[i].string;
        var dataProp = data[i].prop;
        this.versionSearchString = data[i].versionSearch || data[i].identity;
        if (dataString) {
          if (dataString.indexOf(data[i].subString) != -1){
            return data[i].identity;
          }
        }
        else if (dataProp){
          return data[i].identity;
        }
      }
      return false;
     };
    var searchVersion = function (dataString) {
      var index = dataString.indexOf(this.versionSearchString);
      if (index == -1) {return false;}
      return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
    };
    var dataBrowser = [
      {string: agentString, subString: "Chrome", identity: "Chrome"},
      {string: agentString, subString: "Apple", identity: "Safari", versionSearch: "Version"},
      {string: agentString, subString: "Firefox", identity: "Firefox"},
      {string: agentString, subString: "MSIE", identity: "MSIE", versionSearch: "MSIE"}
    ];
    var dataOS = [
      {string: agentString, subString: "Win",identity: "Windows"},
      {string: agentString, subString: "Mac",identity: "Mac"},
      {string: agentString, subString: "iPhone",identity: "iPhone/iPod"},
      {string: agentString, subString: "iPad",identity: "iPad"},
      {string: agentString, subString: "Linux",identity: "Linux"}
    ];

      this.browser = searchString(dataBrowser) || "Unknown";
      this.version = searchVersion(agentString) || searchVersion(agentString) || "X";
      this.OS = searchString(dataOS) || "Unknown";

      return {
        os: this.OS,
        browser: this.browser,
        version: this.version,
        id: this.browser+' '+this.version
      };
    }

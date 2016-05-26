fis.set("atm", {
    useSprite: false, // 是否在开发阶段使用雪碧图合并
    useOptimize: false, // 是否压缩css
    useHash: false, // 是否给文件名加上hash值
    useDomain: false,  // 是否使用CDN路径
    userName: 'allanyu',  // RTX用户名
    projectName: '150525_qb_eurocup', // 项目名称
    wapstatic: 'http://wapstatic.kf0309.3g.qq.com/', // 默认测试环境网页访问地址
    cdnPath: '/2015/market/allanyu' // 上传到CDN的路径, 类似于/2015/market/allanyu, 注意: 必须从/MIG-WEB的子目录开始
});

fis.set('project.files', ['**', '.**', '.**/**'])
    .set('project.ignore', ['node_modules/**', '.idea/**', '.gitignore', '**/_*.scss', '.docs/**',
        'publish/**', '.dist/**', '.git/**', '.svn/**', 'gruntfile.js', 'gulpfile.js', 'fis-conf.js'])
    .set("project.fileType.text", "hbs");

fis.hook('relative');

var atmConf = fis.get("atm");

if (atmConf.useDomain && !!atmConf.cdnPath) {
    atmConf.domain = "http://3gimg.qq.com/mig-web/" + atmConf.cdnPath;
}

/*************************目录规范*****************************/
fis.match('*', {
    relative: true,
    useHash: false,
    useDomain: false,
    domain: atmConf.domain,
    _isResourceMap: false
}).match(/.*\.(html|htm|php)$/, { //页面模板不用编译缓存
    useCache: false,
}).match(/\/css(?:.*\/)(.*)\.(?:css|less|scss)/i, {
    useSprite: atmConf.useSprite,
    useDomain: atmConf.useDomain,
    useHash: atmConf.useHash,
    spriteRelease: '/img/$1.png',
    optimizer: atmConf.useOptimize && fis.plugin('clean-css')
}).match('/css/**.less', {
    rExt: '.css',
    parser: fis.plugin('less')
//}).match('/css/**.scss', {
//    rExt: '.css',
//    parser: fis.plugin('node-sass')
}).match('**mixins?.{less,scss}', {
    release: false
}).match('**mixins?/**.{less,scss}', {
    release: false
}).match("/design/**", {
    release: false
}).match("/font/**", {
    useHash: atmConf.useHash,
    useDomain: atmConf.useDomain
}).match("/img/**", {
    useDomain: atmConf.useDomain,
    useHash: atmConf.useHash
}).match('/img/**.png', {
    optimizer: fis.plugin('png-compressor')
}).match('/js/**', {
    useDomain: atmConf.useDomain,
    useHash: atmConf.useHash
}).match('/mail/**', {
    useCompile: false
}).match('/slice/**', {
    useDomain: atmConf.useDomain,
    useHash: atmConf.useHash
});


fis.match('**', {
    deploy: fis.plugin('local-deliver', {
        to: './publish'
    })
}).match("::packager", {
    spriter: fis.plugin('csssprites', {
        htmlUseSprite: true,
        layout: 'matrix',
        margin: '16',
        scale: 0.5,
        //px2rem: 16,  // 是否使用rem单位
        styleReg: /(<style(?:(?=\s)[\s\S]*?["'\s\w\/\-]>|>))([\s\S]*?)(<\/style\s*>|$)/ig
    }),
    postpackager: [fis.plugin('list-html'), fis.plugin('open', {
        baseUrl: atmConf.wapstatic + atmConf.userName + '/' + atmConf.projectName
    })]
});

['test', 'open'].forEach(function (mediaName) {
    fis.media(mediaName).match("*.{css,less,scss}", {
        useSprite: true,
        optimizer: atmConf.useOptimize && fis.plugin('clean-css')
    }).match('!*.min.{css,less,scss}', {
        optimizer: false
    }).match('*.js', {
        optimizer: atmConf.useOptimize && fis.plugin('uglify-js')
    }).match('!*.min.js', {
        optimizer: false
    }).match('**', {
        deploy: [fis.plugin('local-deliver', {
            to: './publish'
        }), fis.plugin('http-push', {
            receiver: 'http://wapstatic.kf0309.3g.qq.com/receiver/receiver2.php',
            to: '/data/wapstatic/' + atmConf.userName + '/' + atmConf.projectName
        })]
    });
});

fis.media('cdn').match("*.{css,less,scss}", {
    useSprite: true,
    optimizer: atmConf.useOptimize && fis.plugin('clean-css')
}).match('!*.min.{css,less,scss}', {
    optimizer: false
}).match('*.js', {
    optimizer: atmConf.useOptimize && fis.plugin('uglify-js')
}).match('!*.min.js', {
    optimizer: false
}).match('**', {
    deploy: [fis.plugin('local-deliver', {
        to: './publish'
    }), fis.plugin('cdn', {
        remoteDir: atmConf.cdnPath,
        uploadUrl: 'http://super.kf0309.3g.qq.com/qm/upload'
    })]
});

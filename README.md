Rivulet
======================

## DESCRIPTION

Rivuletは、HTML/node.jsをベースとしたリアルタイム更新型のツイッタークライアントです。
[Streamie](https://streamie.org/)(停止中)を基に、webアプリケーションフレームワークのデファクトスタンダードとなっている[express](http://expressjs.com/)を用いて再構築しています。

https://github.com/cramforce/streamie

### Stuff

1. [node.js version 0.10.26](http://nodejs.jp/)
2. [express version 3.4.8](http://expressjs.com/)  
2. [ejs version 0.8.5](http://embeddedjs.com/)
3. [passport version 0.2.0](http://passportjs.org/)
4. [socket.io version 0.9.16](http://socket.io/)
5. [node_twitter version 0.2.9](https://github.com/jdub/node-twitter)
6. [jQuery version 2.1.1](http://jquery.com/)
7. [Bootstrap version 3.1.1](http://getbootstrap.com/)
8. [less.js version 1.7.0](http://lesscss.org/)
9. [underscore.js version 1.6.0](http://underscorejs.org/)
      
## USAGE
自身のPCをサーバーとして動作させることができます。以下を参考にしてください。

    $ git clone https://github.com/YusukeShimizu/Rivulet.git
    $ cd Rivult
    $ vi config.json
    $ node app.js

お使いのブラウザで、

> [http://localhost:5000/](http://localhost:5000/)

にアクセスしてください。

### Note

* [nodejs.org](http://nodejs.org/)より、node.js v0.10.xをインストールしてください。
* クローンするには[Git Hub](https://github.com/)アカウントが必要となります。
* Consumer Key/Secretが必要です。[https://dev.twitter.com/](https://dev.twitter.com/)より取得可能です。

 
## TODO

* Desktop notifications
* i18n
* correspond to mutability
* reconnect 

## <a name = LICENCE></a>LICENCE
Simplified BSD License
Copyright 2014 Yusuke Shimizu. All rights reserved.

## <a name = AUTHOR></a>AUTHOR
[Yusuke Shimizu](http://twitter.com/Bruwbird) 


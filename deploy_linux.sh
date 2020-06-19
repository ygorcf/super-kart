
PASTA_DESTINO=/var/www/html/phaser

rm -rf ${PASTA_DESTINO}
mkdir ${PASTA_DESTINO}
cp -R ./src/* ${PASTA_DESTINO}
chown -R ygor.ygor ${PASTA_DESTINO}
chmod -R 765 ${PASTA_DESTINO}

service nginx reload

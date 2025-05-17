FROM prom/alertmanager:latest

USER root

# Установим wget, если он не установлен
# Скачиваем и устанавливаем gettext
RUN wget https://ftp.gnu.org/gnu/gettext/gettext-0.21.tar.gz && \
    tar -xvzf gettext-0.21.tar.gz && \
    cd gettext-0.21 && \
    ./configure && \
    make && \
    make install

ENTRYPOINT ["sh", "-c"]

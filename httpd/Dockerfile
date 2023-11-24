FROM httpd:latest

COPY . /usr/local/apache2/htdocs/

RUN echo "Alias /voting /usr/local/apache2/htdocs/" >> /usr/local/apache2/conf/httpd.conf
RUN echo "LoadModule proxy_module modules/mod_proxy.so" >> /usr/local/apache2/conf/httpd.conf
RUN echo "LoadModule proxy_http_module modules/mod_proxy_http.so" >> /usr/local/apache2/conf/httpd.conf
RUN echo "ProxyPass /api/candidates http://candidates_node:3001" >> /usr/local/apache2/conf/httpd.conf
RUN echo "ProxyPass /api/voters http://voters_node:3002" >> /usr/local/apache2/conf/httpd.conf
#RUN echo "ProxyPassReverse /api http://0.0.0.0:3000" >> /usr/local/apache2/conf/httpd.conf

EXPOSE 80
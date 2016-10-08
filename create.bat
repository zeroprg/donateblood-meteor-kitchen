copy .\files\*.*  %AppData%\..\Local\Temp\files

del ..\donateblood\.meteor-kitchen.json

cd ..

meteor-kitchen http://www.meteorkitchen.com/api/getapp/json/BwJwr56a3bF8Wj7ZT donateblood

cd donateblood
meteor


rem xcopy  .\files\client\* .\donors /s /i
rem xcopy  .\files\server\* .\donors /s /i
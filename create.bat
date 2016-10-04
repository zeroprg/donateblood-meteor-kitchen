copy .\files\*.*  %AppData%\..\Local\Temp\files

del .\donors\.meteor-kitchen.json
meteor-kitchen http://www.meteorkitchen.com/api/getapp/json/BwJwr56a3bF8Wj7ZT donors


cd .\donors
meteor


rem xcopy  .\files\client\* .\donors /s /i
rem xcopy  .\files\server\* .\donors /s /i
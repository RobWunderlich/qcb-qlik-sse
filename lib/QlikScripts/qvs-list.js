//Get all qvs script's from a directory
function GetfilesContentFromDir(pathdir){   
    const fs = require('fs');
 
    var files = fs.readdirSync(pathdir);    


    var fileList=[];   

    files.forEach(function(file) {

        var contents = fs.readFileSync(pathdir + file, 'utf8');
        fileList.push({File: file, Content: contents});
      })

    return fileList;

}

//split qvs string by line
function SplitFilesContentLines(fileList){


    for (iterator = 0; iterator <  fileList.length; iterator++) {

        fileList[iterator].Content = fileList[iterator].Content.split('\n')

    }

    return fileList;

}

function GetFunctionNameFromFile(file){

    var content = file.Content[0];

    var functionName = content.replace('FunctionName:','')

    return functionName.trim();

}

function GetFunctionParamsFromFile(file){

    var content = file.Content[1];

    var functionParams = content.replace('Params:','').trim().split(',')

    return functionParams;

}

function GetFunctionDefinitionFromFile(file){

    file.Content.splice(0,2);

    var FunctionDefinition = file.Content.join('\n')

    return FunctionDefinition.trim();
}

function ConvertFileListInQvsList(fileList){

    var qvsList=[];

    fileList.forEach(function(value){

        qvs ={}
        qvs.FunctionName        =   GetFunctionNameFromFile(value)
        qvs.FunctionParams      =   GetFunctionParamsFromFile(value)
        qvs.FunctionDefinition  =   GetFunctionDefinitionFromFile(value)


        qvsList.push(qvs)
    });

    return qvsList;

}


function GetQvsList(path){

    var fileList    =   GetfilesContentFromDir(path);
        fileList    =   SplitFilesContentLines(fileList);


    return ConvertFileListInQvsList(fileList);
}
qvsList = GetQvsList('./lib/QlikScripts/qvs/')

module.exports=qvsList

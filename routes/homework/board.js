var express = require('express');
var router = express.Router();
const crypto = require('crypto-promise');
var json2csv = require('async-json2csv');
var csv = require("csvtojson");
const fs = require("fs");
const util = require('../../module//utils');//js안붙여도 되나?
const statusCode = require('../../module/statusCode');
const resMessage = require('../../module/responseMessage');
const moment = require('moment');
//post(저장할 정보-게시물 고유 id(id), 게시물 제목(title), 게시물 내용(contents), 게시물 작성 시간(time), 게시물 비밀번호(pwd), 솔트 값(salt))
//저장 시 같은 제목의 글이 있으면 실패 메세지 반환, 게시물 작성 시간은 서버 코드에서 넣는다.
//localhost:3000/homework/board/
//의문점->저장 시 같은 제목의 글이 있다는 것은 이전의 글들을 미리 db or csv형태로 저장? 그러면 아예 처음 게시물은 비교 어떻게???ㅜ
const boardFinal=[];//post에서 쓰이는 배열
router.post('/', async(req, res) => {
    var writeBoard=async function(){//게시물 작성 함수
        const Info = {
            id: req.body.id,
            title: req.body.title,
            contents: req.body.contents,
            pwd: req.body.pwd
        }
        //try/catch로 await의 오류 잡음
        try {
            const salt = await crypto.randomBytes(32);
            Info.salt = salt.toString('base64');//salt값        
            Info.time = moment().format("YYYY-MM-DD HH:mm:ss");
            //async-json2csv 모듈을 사용한 것 입니다.
            //위의 options를 똑같이 지켜줘야 여러분이 아는 csv 파일 형태로 저장되오니 꼭 지켜주세요.
            boardFinal.push(Info);
            const boardInfoCsv = await json2csv({
                data: boardFinal,
                fields: ['id', 'title', 'contents', 'time', 'pwd', 'salt'],
                header: true
            });
            fs.writeFileSync('boardInfo_1.csv', boardInfoCsv);

            //파일 저장까지 완료되면 성공 response를 날립니다.
            res.status(200).send(util.successTrue(statusCode.CREATED, resMessage.BOARD_SAVE_SUCCESS));
        } catch (err) {
            //에러 발생 시 실패 response를 날립니다.
            res.status(200).send(util.successFalse(statusCode.INTERNAL_SERVER_ERROR, resMessage.SAVE_FAIL));
        }
    };
    const readCsvFile = (filePath) => { //promise 객체를 반환하는 함수를 만들어줍니다. readCsv라는 함수는 fileName이라는 매개변수를 가지는 함수이다.
        return new Promise((resolve, reject) => {//promise객체는 성공시에는 resolve를 실패시에는 reject를 반환한다.
           csv().fromFile(filePath).then((jsonObj) => {//then의 첫 번째 매개변수 이니 성공을 의미 즉, fileName을 읽어서 csvtojson을 성공 했을 때를 의미!!
                if (jsonObj != null) {//그 중에서도 jsonObj가 null이 아니라 값이 들어있으면, 전체 promise함수에서 
                    resolve(jsonObj);//성공시 반환되는 promise 객체?
                } else {//일단 fileName을 읽어서 csvtojson은 성공을 했지만 jsonObj가 null일 경우
                    reject(resMessage.READ_FAIL);//실패시 반환되는 promise객체?
                }
            },()=>{//아예 file 자체가 존재하지 않는 경우, 처음 게시물 작성
                jsonObj=[];
                writeBoard();
            });
        })
    }
    readCsvFile('boardInfo_1.csv')
    .then((jsonObj) => {//file이 있으면 then첫 번째 파라미터 실행
        //console.log("hi_2");
        for (var i = 0; i < jsonObj.length; i++) {
            if(jsonObj[i].title == req.body.title){
                break;
            }
        }
        if (i<jsonObj.length) {//jsonObj가 비어 있지 않고 일치하는 학번이 존재할 경우 jsonObj[i].id == req.params.id와 뭐가 다르지???....후자로 하면 오류 생김...
            //같은 제목인 게시물이 있으면 실패 메세지 반환
            res.status(200).send(util.successFalse(statusCode.BAD_REQUEST, resMessage.ALREADY_BOARD));
        } else{//r같은 제목의 게시물이 없을 경우
            writeBoard();//게시물 작성
        }
    }, (message) =>{//reject를 반환 받으니 file은 읽었지만 jsonObj값이 null일 경우?
        jsonObj=[];
        writeBoard();//게시물 작성
    });
});
//get(게시글 고유 id가 id인 게시글을 불러온다.)
router.get('/:id', (req, res) => {
    const readCsvFile = (filePath) => { //promise 객체를 반환하는 함수를 만들어줍니다. readCsv라는 함수는 fileName이라는 매개변수를 가지는 함수이다.
        return new Promise((resolve, reject) => {//promise객체는 성공시에는 resolve를 실패시에는 reject를 반환한다.
           csv().fromFile(filePath).then((jsonObj) => {//then의 첫 번째 매개변수 이니 성공을 의미 즉, fileName을 읽어서 csvtojson을 성공 했을 때를 의미!!
                if (jsonObj != null) {//그 중에서도 jsonObj가 null이 아니라 값이 들어있으면, 전체 promise함수에서 
                    resolve(jsonObj);//성공시 반환되는 promise 객체?
                } else {//일단 fileName을 읽어서 csvtojson은 성공을 했지만 jsonObj가 null일 경우
                    reject(resMessage.READ_FAIL);//실패시 반환되는 promise객체?
                }
            }, (message)=>{//file이 아예 없을 경우-->게시물을 불러올 수 없다.
                res.status(200).send(util.successFalse(statusCode.INTERNAL_SERVER_ERROR, message));
            });
        })
    }

    readCsvFile('boardInfo_1.csv')
    .then((jsonObj) => {//readCsv함수를 실행을 해서 성공을 하게 되면(studentInfo.csv를 json객체로 성공적으로 바꾸었고 null값도 아니었다.) 즉, 반환되는 값이 resolve이면? (그러면 반환된 jsonObj가 studentData가 되는 것!!!!)
            for (var i = 0; i < jsonObj.length; i++) {//즉, 반환된 jsonObj의 length를 의미!
                if (jsonObj[i].id == req.params.id) {
                    break;
                }
            }
            if (jsonObj[i].id == req.params.id) {//id가 일치하는 게시물이 있으면
                res.status(200).send(util.successTrue(statusCode.OK, resMessage.BOARD_SELECT_SUCCESS, jsonObj[i]));
            } else {//id가 일치하는 게시물이 없으면
                res.status(200).send(util.successFalse(statusCode.BAD_REQUEST, resMessage.NO_BOARD));
            }
        }, (message) => {//readCsv함수를 실행해서 성공하지 못한 경우(studentInfo.csv를 json객체로 성공적으로 바꾸었지만 null값이었다.), 즉, 반환되는 값이 reject이면?
            res.status(200).send(util.successFalse(statusCode.INTERNAL_SERVER_ERROR, message));
        });
});
//게시물 고유 id와 같은 게시물을 수정된 값으로 다시 저장합니다.(게시물 작성 시간까지 같이 수정!)
router.put('/', (req, res)=>{
    const readCsvFile = (filePath) => { //promise 객체를 반환하는 함수를 만들어줍니다. readCsv라는 함수는 fileName이라는 매개변수를 가지는 함수이다.
        return new Promise((resolve, reject) => {//promise객체는 성공시에는 resolve를 실패시에는 reject를 반환한다.
           csv().fromFile(filePath).then((jsonObj) => {//then의 첫 번째 매개변수 이니 성공을 의미 즉, fileName을 읽어서 csvtojson을 성공 했을 때를 의미!!
                if (jsonObj != null) {//그 중에서도 jsonObj가 null이 아니라 값이 들어있으면, 전체 promise함수에서 
                    resolve(jsonObj);//성공시 반환되는 promise 객체?
                } else {//일단 fileName을 읽어서 csvtojson은 성공을 했지만 jsonObj가 null일 경우
                    reject(resMessage.READ_FAIL);//실패시 반환되는 promise객체?
                }
            }, ()=>{//file이 아예 없을 경우-->게시물을 불러올 수 없다.
                res.status(200).send(util.successFalse(statusCode.INTERNAL_SERVER_ERROR, resMessage.CANNOT_LOAD_BOARD));
            });
        })
    }

    readCsvFile('boardInfo_1.csv')
    .then(async(jsonObj) => {//readCsv함수를 실행을 해서 성공을 하게 되면(studentInfo.csv를 json객체로 성공적으로 바꾸었고 null값도 아니었다.) 즉, 반환되는 값이 resolve이면? (그러면 반환된 jsonObj가 studentData가 되는 것!!!!)
            for (var i = 0; i < jsonObj.length; i++) {//즉, 반환된 jsonObj의 length를 의미!
                if (jsonObj[i].id == req.body.id) {
                    break;
                }
            }
            if (i<jsonObj.length) {//id가 일치하는 게시물이 있으면-->수정한다.
                //console.log(jsonObj[i].id);
                jsonObj[i].title=req.body.title;
                jsonObj[i].contents=req.body.contents;
                jsonObj[i].pwd=req.body.pwd;
                jsonObj[i].time=moment().format("YYYY-MM-DD HH:mm:ss");
                const boardInfoFinalCsv = await json2csv({
                    data: jsonObj,
                    fields: ['id', 'title', 'contents', 'time', 'pwd', 'salt'],
                    header: true
                });
                fs.writeFileSync('boardInfo_1.csv', boardInfoFinalCsv);  
                for(var i=0; i< boardFinal.length; i++){
                    boardFinal.pop();
                }
                for(var i=0; i< jsonObj.length; i++){
                    boardFinal[i]=jsonObj[i];     
                }
                res.status(200).send(util.successTrue(statusCode.OK, resMessage.BOARD_CHANGE_SUCCESS));
            } else {//id가 일치하는 게시물이 없으면
                res.status(200).send(util.successFalse(statusCode.BAD_REQUEST, resMessage.NO_BOARD));
            }
        }, (message) => {//readCsv함수를 실행해서 성공하지 못한 경우(studentInfo.csv를 json객체로 성공적으로 바꾸었지만 null값이었다.), 즉, 반환되는 값이 reject이면?
            res.status(200).send(util.successFalse(statusCode.INTERNAL_SERVER_ERROR, message));
        });
});
//게시물 고유 id와 같은 게시물을 삭제
router.delete('/', (req, res)=>{
    const readCsvFile = (filePath) => { //promise 객체를 반환하는 함수를 만들어줍니다. readCsv라는 함수는 fileName이라는 매개변수를 가지는 함수이다.
        return new Promise((resolve, reject) => {//promise객체는 성공시에는 resolve를 실패시에는 reject를 반환한다.
           csv().fromFile(filePath).then((jsonObj) => {//then의 첫 번째 매개변수 이니 성공을 의미 즉, fileName을 읽어서 csvtojson을 성공 했을 때를 의미!!
                if (jsonObj != null) {//그 중에서도 jsonObj가 null이 아니라 값이 들어있으면, 전체 promise함수에서 
                    resolve(jsonObj);//성공시 반환되는 promise 객체?
                } else {//일단 fileName을 읽어서 csvtojson은 성공을 했지만 jsonObj가 null일 경우
                    reject(resMessage.READ_FAIL);//실패시 반환되는 promise객체?
                }
            }, ()=>{//file이 아예 없을 경우-->게시물을 불러올 수 없다.
                res.status(200).send(util.successFalse(statusCode.INTERNAL_SERVER_ERROR, resMessage.CANNOT_LOAD_BOARD));
            });
        })
    }

    readCsvFile('boardInfo_1.csv')
    .then(async(jsonObj) => {//readCsv함수를 실행을 해서 성공을 하게 되면(studentInfo.csv를 json객체로 성공적으로 바꾸었고 null값도 아니었다.) 즉, 반환되는 값이 resolve이면? (그러면 반환된 jsonObj가 studentData가 되는 것!!!!)
            for (var i = 0; i < jsonObj.length; i++) {//즉, 반환된 jsonObj의 length를 의미!
                if (jsonObj[i].id == req.body.id) {
                    break;
                }
            }
            if (i<jsonObj.length) {//id가 일치하는 게시물이 있으면-->수정한다.
                jsonObj.splice(i,1);
                const boardInfoFinalCsv = await json2csv({
                    data: jsonObj,
                    fields: ['id', 'title', 'contents', 'time', 'pwd', 'salt'],
                    header: true
                });
                fs.writeFileSync('boardInfo_1.csv', boardInfoFinalCsv); 
                for(var i=0; i< boardFinal.length; i++){
                    boardFinal.pop();
                }
                for(var i=0; i< jsonObj.length; i++){
                    boardFinal[i]=jsonObj[i];     
                }
                res.status(200).send(util.successTrue(statusCode.OK, resMessage.BOARD_DELETE_SUCCESS));
            } else {//id가 일치하는 게시물이 없으면
                res.status(200).send(util.successFalse(statusCode.BAD_REQUEST, resMessage.NO_BOARD));
            }
        }, (message) => {//readCsv함수를 실행해서 성공하지 못한 경우(studentInfo.csv를 json객체로 성공적으로 바꾸었지만 null값이었다.), 즉, 반환되는 값이 reject이면?
            res.status(200).send(util.successFalse(statusCode.INTERNAL_SERVER_ERROR, message));
        });
});

module.exports = router ;
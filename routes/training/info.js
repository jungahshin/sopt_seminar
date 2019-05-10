var express = require('express');
var router = express.Router();
const crypto = require('crypto-promise');
var json2csv = require('async-json2csv');
var csv = require("csvtojson");
const fs = require("fs");
const util = require('../../module//utils');//js안붙여도 되나?
const statusCode = require('../../module/statusCode');
const resMessage = require('../../module/responseMessage');
//getData_hw.csv에는 학생의 학번(id), 나이(age), 솔트 값(salt), 이름(name), 학교(colleage), 전공(major)이 있어야 해

//현재 위치 경로: localhost:3000/training/info
//localhost:3000/training/info/:id (GET Method)
//id 라는 파라미터는 학생의 학번을 뜻합니다 router.get('/:id')==>내가 id값을 입력하는 것이다. 그리고 받을 때에는 req.params.id로 받는다.

/*
내 처음 방식...!
router.get('/:id', (req, res) => {
    //console.log("hi");
    const csvFilePath='/Users/jungahshin/Documents/sopt/seminar_3/studentInfo_1.csv';
    csv().fromFile(csvFilePath).then((jsonObj)=>{//file이 있으면 then첫 번째 파라미터 실행
        //console.log("hi_2");
        if(jsonObj!=null){
            //console.log(jsonObj);
            for (var i = 0; i < jsonObj.length; i++) {
                if(jsonObj[i].id == req.params.id){
                    break;
                }
            }
            if (jsonObj[i].id == req.params.id) {//jsonObj가 비어 있지 않고 일치하는 학번이 존재할 경우 jsonObj[i].id == req.params.id와 뭐가 다르지???....
                delete jsonObj[i].age;//원래 geData_hw.csv파일에 있던 age, salt를 제외한 jsonObg[i]의 값을 반환
                delete jsonObj[i].salt;
                res.status(200).send(util.successTrue(statusCode.OK, resMessage.STUDENT_SELECT_SUCCESS, jsonObj[i]));
                console.log(jsonObj[i]);
            }else{//jsonObj가 비어있지는 않지만 일치하는 학번이 없을 경우
                res.status(200).send(util.successFalse(statusCode.BAD_REQUEST, resMessage.NO_STUDENT));
            }
        }
    }, (message) =>{//아예 file자체를 찾을 수 없는 경우
        res.status(200).send(util.successFalse(statusCode.INTERNAL_SERVER_ERROR, message));
    });
});
*/
router.get('/:id', (req, res) => {
    const readCsvFile = (filePath) => { //promise 객체를 반환하는 함수를 만들어줍니다. readCsv라는 함수는 fileName이라는 매개변수를 가지는 함수이다.
        return new Promise((resolve, reject) => {//promise객체는 성공시에는 resolve를 실패시에는 reject를 반환한다.
           csv().fromFile(filePath).then((jsonObj) => {//then의 첫 번째 매개변수 이니 성공을 의미 즉, fileName을 읽어서 csvtojson을 성공 했을 때를 의미!!
                if (jsonObj != null) {//그 중에서도 jsonObj가 null이 아니라 값이 들어있으면, 전체 promise함수에서 
                    resolve(jsonObj);//성공시 반환되는 promise 객체?
                } else {//일단 fileName을 읽어서 csvtojson은 성공을 했지만 jsonObj가 null일 경우
                    reject(resMessage.READ_FAIL);//실패시 반환되는 promise객체?
                }
            })
        })
    }

    readCsvFile('/Users/jungahshin/Documents/sopt/seminar_3/studentInfo_1.csv')
    .then((jsonObj) => {//readCsv함수를 실행을 해서 성공을 하게 되면(studentInfo.csv를 json객체로 성공적으로 바꾸었고 null값도 아니었다.) 즉, 반환되는 값이 resolve이면? (그러면 반환된 jsonObj가 studentData가 되는 것!!!!)
            for (var i = 0; i < jsonObj.length; i++) {//즉, 반환된 jsonObj의 length를 의미!
                if (jsonObj[i].id == req.params.id) {
                    break;
                }
            }
            if (jsonObj[i].id == req.params.id) {//학번이 일치하는 학생이 있으면
                delete jsonObj[i].age;
                delete jsonObj[i].salt;
                res.status(200).send(util.successTrue(statusCode.OK, resMessage.STUDENT_SELECT_SUCCESS, jsonObj[i]));
            } else {//학번이 일치하는 학생이 없으면
                res.status(200).send(util.successFalse(statusCode.BAD_REQUEST, resMessage.NO_STUDENT));
            }
        }, (message) => {//readCsv함수를 실행해서 성공하지 못한 경우(studentInfo.csv를 json객체로 성공적으로 바꾸었지만 null값이었다.), 즉, 반환되는 값이 reject이면?
            res.status(200).send(util.successFalse(statusCode.INTERNAL_SERVER_ERROR, message));
        });
});
/*
router.post('/', async(req, res) => {
    //console.log('hi');
    //body = { 'id': '20161128', 'name':'신정아', 'univ': '덕성여대', 'major': 'IT미디어공학과', 'age': '24'}
    //post는 postman에서만 실행가능????그런 것 같다....

    if (!req.body.id || !req.body.name) {//저장 시 필수 값인 학번(id)과 이름(name)이 둘중 하나라도 없으면(null) 실패 response 전송
        res.status(200).send(util.successFalse(statusCode.BAD_REQUEST, resMessage.NULL_VALUE));
    } else {
        console.log("hi");
        const Info = {
            id: req.body.id,
            name: req.body.name,
            univ: req.body.univ,
            major: req.body.major,
            age: req.body.age
        }

        //try/catch로 await의 오류 잡음
        try {
            //console.log("hi_2");
            //나이 값을 해싱하기 위한 랜덤 바이트 생성
            const salt = await crypto.randomBytes(32);
            //나이 값 해싱
            //해당 모듈에서는 해싱하는 값이 string type이여야 하기 때문에 정수로 들어온 나이를 문자로 바꿔줍니다.
            const hashedAge = await crypto.pbkdf2(Info.age.toString(), salt.toString('base64'), 1000, 32, 'SHA512');//salt.toString('base64')자체가 salt값

            Info.salt = salt.toString('base64');//salt값
            Info.age = hashedAge.toString('base64');//최종 해싱된 age

            //async-json2csv 모듈을 사용한 것 입니다.
            //위의 options를 똑같이 지켜줘야 여러분이 아는 csv 파일 형태로 저장되오니 꼭 지켜주세요.
            const stuInfoCsv = await json2csv({
                data: [Info],
                fields: ['id', 'name', 'univ', 'major', 'age', 'salt'],
                header: true
            });
            fs.writeFileSync('studentInfo_1.csv', stuInfoCsv);

            //파일 저장까지 완료되면 성공 response를 날립니다.
            res.status(200).send(util.successTrue(statusCode.CREATED, resMessage.SAVE_SUCCESS));
        } catch (err) {
            //에러 발생 시 실패 response를 날립니다.
            res.status(200).send(util.successFalse(statusCode.INTERNAL_SERVER_ERROR, resMessage.SAVE_FAIL));
        }
    }
});
*/
router.post('/', async(req, res) => {
    //body = { 'id': '20161128', 'name':'신정아', 'univ': '덕성여대', 'major': 'IT미디어공학과', 'age': '24'}
    //post는 postman에서만 실행가능????그런 것 같다....
    const Info_final=[];//Info json객체들 저장하는 list
    for(i=0; i < req.body.length; i++){
        if (!req.body[i].id || !req.body[i].name) {//저장 시 필수 값인 학번(id)과 이름(name)이 둘중 하나라도 없으면(null) 실패 response 전송
            res.status(200).send(util.successFalse(statusCode.BAD_REQUEST, resMessage.NULL_VALUE));
        } else {
            const Info = {
                id: req.body[i].id,
                name: req.body[i].name,
                univ: req.body[i].univ,
                major: req.body[i].major,
                age: req.body[i].age
            }

            //try/catch로 await의 오류 잡음
            try {
                //console.log("hi_2");
                //나이 값을 해싱하기 위한 랜덤 바이트 생성
                const salt = await crypto.randomBytes(32);
                //나이 값 해싱
                //해당 모듈에서는 해싱하는 값이 string type이여야 하기 때문에 정수로 들어온 나이를 문자로 바꿔줍니다.
                const hashedAge = await crypto.pbkdf2(Info.age.toString(), salt.toString('base64'), 1000, 32, 'SHA512');//salt.toString('base64')자체가 salt값

                Info.salt = salt.toString('base64');//salt값
                Info.age = hashedAge.toString('base64');//최종 해싱된 age
            } catch (err) {
                //에러 발생 시 실패 response를 날립니다.
                res.status(200).send(util.successFalse(statusCode.INTERNAL_SERVER_ERROR, resMessage.SAVE_FAIL));
            }
            Info_final.push(Info);
        }
    }
    //console.log(Info_final);
    const stuInfoCsv = await json2csv({
        data: Info_final,
        fields: ['id', 'name', 'univ', 'major', 'age', 'salt'],
        header: true
    });
    fs.writeFileSync('studentInfo_1.csv', stuInfoCsv);

    //파일 저장까지 완료되면 성공 response를 날립니다.
    res.status(200).send(util.successTrue(statusCode.CREATED, resMessage.SAVE_SUCCESS));
        
});
module.exports = router ;

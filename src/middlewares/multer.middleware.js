import multer from "multer";

//The disk storage engine gives you full control on storing files to disk.

const storage = multer.diskStorage({
    destination: function (req, file, cb) {   // yha cb callback function h 
        cb(null, './public/temp')
    },
    filename: function (req, file, cb) {

        cb(null, file.originalname)  // yha se file ka localpath vala original name milega
    }
})

const upload = multer(
    {
      //  storage: storage   // agr dono same ho to use single hi likh skte h 
      storage,

    }
)
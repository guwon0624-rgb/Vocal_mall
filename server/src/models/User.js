const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const agreementsSchema = new mongoose.Schema(
  {
    terms: {
      type: Boolean,
      required: [true, "이용약관 동의는 필수입니다."],
      validate: {
        validator: (value) => value === true,
        message: "이용약관에 동의해 주세요.",
      },
    },
    privacy: {
      type: Boolean,
      required: [true, "개인정보 제공 동의는 필수입니다."],
      validate: {
        validator: (value) => value === true,
        message: "개인정보 제공에 동의해 주세요.",
      },
    },
    marketing: {
      type: Boolean,
      default: false,
    },
    agreedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  },
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "이름은 필수입니다."],
      trim: true,
    },
    activityName: {
      type: String,
      trim: true,
      maxlength: [30, "활동명은 30자 이하여야 합니다."],
    },
    age: {
      type: Number,
      min: [1, "나이는 1세 이상이어야 합니다."],
      max: [120, "나이는 120세 이하여야 합니다."],
    },
    email: {
      type: String,
      required: [true, "이메일은 필수입니다."],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "올바른 이메일 주소를 입력해 주세요.",
      ],
    },
    password: {
      type: String,
      required: [true, "비밀번호는 필수입니다."],
      minlength: [8, "비밀번호는 8자 이상이어야 합니다."],
      select: false,
    },
    gender: {
      type: String,
      required: [true, "성별은 필수입니다."],
      trim: true,
    },
    role: {
      type: String,
      required: [true, "권한은 필수입니다."],
      enum: {
        values: ["학생", "코치", "어드민"],
        message: "권한은 학생, 코치 또는 어드민이어야 합니다.",
      },
    },
    voiceType: {
      type: String,
      enum: {
        values: ["베이스", "바리톤", "테너", "알토", "소프라노"],
        message:
          "성종은 베이스, 바리톤, 테너, 알토, 소프라노 중 하나여야 합니다.",
      },
    },
    goal: {
      type: String,
      required: [true, "목표는 필수입니다."],
      enum: {
        values: ["취미", "입시", "가수"],
        message: "목표는 취미, 입시, 가수 중 하나여야 합니다.",
      },
    },
    referralSource: {
      type: String,
      enum: {
        values: ["지인", "유튜브", "인스타", "스레드", "기타"],
        message:
          "가입 경로는 지인, 유튜브, 인스타, 스레드, 기타 중 하나여야 합니다.",
      },
    },
    agreements: {
      type: agreementsSchema,
      required: [true, "필수 약관에 동의해 주세요."],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_document, returnedObject) => {
        delete returnedObject.password;
        return returnedObject;
      },
    },
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);

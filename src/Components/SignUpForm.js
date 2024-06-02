import React, { useEffect, useRef, useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import "./main.scss";
import { useNavigate } from "react-router-dom";

const SignupForm = ({ setIsAuth }) => {
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const navigate = useNavigate();
  const emailInputRef = useRef(null);

  const handleSignUp = async (e) => {
    e.preventDefault();
    const target = e.target;
    const email = target.email.value;
    const password = target.password.value;

    // パスワードと再確認パスワードが一致するかを確認
    if (password !== passwordConfirmation) {
      alert("パスワードが一致しません。");
      return;
    }

    const auth = getAuth();
    try {
      if (
        password.length < 6 || // 最低6文字
        password.length > 15 || // 最大10文字
        !/[A-Z]/.test(password) || // 大文字が含まれているか
        !/[a-z]/.test(password) || // 小文字が含まれているか
        !/\d/.test(password) // 数字が含まれているか
      ) {
        throw new Error(
          "パスワードは少なくとも6文字で、大文字、小文字、数字を含む必要があり、最大15文字です。"
        );
      }
      await createUserWithEmailAndPassword(auth, email, password);
      setSignupSuccess(true); // 登録成功時にsignupSuccessをtrueに設定
      setTimeout(() => {
        navigate("/home");
      }, 3000); // 3秒後にホームに移動
    } catch (e) {
      alert(e.message);
    }
  };

  const handlePasswordConfirmationChange = (e) => {
    setPasswordConfirmation(e.target.value);
  };

  const handleTogglePasswordVisibility = (isVisible) => {
    setShowPassword(isVisible);
  };

  const handleHomeRedirect = () => {
    localStorage.setItem("isAuth", true);
    setIsAuth(true);
    navigate("/home");
  };

  const adjustInputWidth = () => {
    if (emailInputRef.current) {
      const minWidth = 265;
      const maxWidth = 500;
      emailInputRef.current.style.width = `${minWidth}px`;
      const scrollWidth = emailInputRef.current.scrollWidth;
      if (scrollWidth > minWidth && scrollWidth < maxWidth) {
        emailInputRef.current.style.width = `${scrollWidth}px`;
      } else if (scrollWidth >= maxWidth) {
        emailInputRef.current.style.width = `${maxWidth}px`;
      }
    }
  };

  useEffect(() => {
    adjustInputWidth(); // 初期ロード時に幅を調整
  }, []);

  return (
    <div className="container">
      <div className="content2">
        <div className="">
          <button
            className="close-button"
            onClick={() => {
              navigate("/");
            }}
          >
            ｘ
          </button>
          <h2>新規登録</h2>
        </div>

        {!signupSuccess ? (
          <div>
            <form className="" onSubmit={handleSignUp}>
              <div className="signup-form">
                <p>email</p>
                <input
                  className="signup-form-input"
                  name="email"
                  type="email"
                ></input>
              </div>
              <div className="signup-form">
                <p>パスワード</p>
                <label className="lubi">
                  6〜15文字で、大文字、小文字、数字を含むもの
                </label>
                <div className="signup-form-password">
                  <input
                    className="signup-form-input-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                  ></input>
                  <button
                    className="signup-password-show-button"
                    type="button"
                    onMouseDown={() => handleTogglePasswordVisibility(true)}
                    onMouseUp={() => handleTogglePasswordVisibility(false)}
                    onMouseLeave={() => handleTogglePasswordVisibility(false)} // マウスがボタンを離れたときも非表示にする
                  >
                    Show
                  </button>
                </div>
              </div>
              <div className="signup-form">
                <p>パスワード再確認</p>
                <input
                  className="signup-form-input-password-confirm"
                  type="password"
                  value={passwordConfirmation}
                  onChange={handlePasswordConfirmationChange}
                ></input>
              </div>
              {/* <label className="signup-form-label">新規登録</label> */}
              <button className="signup-form-button" type="submit">
                新規登録
              </button>
            </form>
          </div>
        ) : (
          <div className="signup-success-message" onClick={handleHomeRedirect}>
            登録が成功しました！
          </div>
        )}
      </div>
    </div>
  );
};

export default SignupForm;

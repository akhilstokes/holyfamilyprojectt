# Page snapshot

```yaml
- generic [ref=e5]:
  - img "Company Logo" [ref=e8]
  - link " Back to Home" [ref=e10] [cursor=pointer]:
    - /url: /
    - generic [ref=e11]: 
    - text: Back to Home
  - heading "Create Account" [level=2] [ref=e12]
  - generic [ref=e15]:
    - button "Sign in with Google. Opens in new tab" [ref=e17] [cursor=pointer]:
      - generic [ref=e19]:
        - img [ref=e21]
        - generic [ref=e27]: Sign in with Google
    - generic:
      - iframe
      - button "Sign in with Google. Opens in new tab"
  - generic [ref=e28]: Or with email
  - generic [ref=e33]:
    - generic [ref=e34]:
      - textbox "Full Name" [ref=e35]
      - generic [ref=e36]: Letters only, no spaces or numbers
    - generic [ref=e37]:
      - textbox "Email Address" [ref=e38]
      - generic [ref=e39]: We'll send confirmations here
    - generic [ref=e40]:
      - textbox "Phone Number" [ref=e41]
      - generic [ref=e42]: 10-digit Indian mobile number (6,7,8,9)
    - button "Register" [disabled] [ref=e43]
    - generic [ref=e44]:
      - button "Previous" [disabled] [ref=e45]
      - button "Next" [disabled] [ref=e46]
  - paragraph [ref=e47]:
    - text: Already have an account?
    - link "Login here" [ref=e48] [cursor=pointer]:
      - /url: /login
```
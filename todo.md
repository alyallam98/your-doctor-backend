Split into Clean Services
Service Method Examples

UserAuthService login(), register()

EmployeeAuthService login(), refreshToken()

PasswordService forgot(), reset(), change()

TokenService refreshUserToken(), refreshEmployeeToken()

EmailVerificationService verify(), resendCode()

add cancellation-reasons
id
code
name
active
type {
code
name
}

name type active
query ($input: ListLookupEntriesFilterInput!) {
listLookupEntriesDropdown(input: $input) {
id
name
code
}
}
{
"input": {
"code": "SHP_REASON_TYPE"
}
}

# add lookup

exports.get_user_input = (body) => {
    inputArr = []
    for (const input in body)
        inputArr.push({ param: input, value: body[input] })
    return inputArr;
}
// console.log(this.get_user_input({ userName: 'asg', email: '', password: '', passwordConfirmation: '' })[2].value)